# VIRI pre-deploy check.  Run from the project folder:
#
#     ruby tools/check.rb            check everything
#     ruby tools/check.rb --stamp    also re-stamp ?v= in index.html, then check
#     ruby tools/check.rb --removed=planEnd,oldThing
#                                    accept these names as deliberately removed
#
# Exit status is 0 when it is safe to deploy and 1 when it is not.
#
# Every check here exists because the thing it catches has already happened:
#
#   syntax    a scripted edit left app.js unparseable and nothing noticed until
#             the live site was blank.
#   functions a `.*?` regex edit deleted eight functions, among them the About,
#             Studios and Contact pages, and was pushed. Any top-level function
#             or const that is on the live site but missing here fails the check.
#   writes    Postgres row-level security does not refuse an UPDATE or DELETE it
#             does not permit, it matches no rows, and Supabase reports success.
#             Accepting a request, marking messages read and saving a profile all
#             "worked" and did nothing. Every update and delete in db.js must go
#             through written(), which treats no rows as the failure it is.
#   roster    code written while members were fictional kept reaching for the
#             sample roster (VIRI.people) and showed empty lists to real members.
#             Only personById() may touch it.
#   venues    duplicate ids, a venue in the wrong city, a coordinate geocoded to
#             the wrong borough.
#   cache     app.js and styles.css are cached hard. A deploy that changes them
#             without changing ?v= looks to everyone like nothing shipped.
#
# Needs nothing beyond macOS: /usr/bin/ruby, curl, and the JavaScriptCore shell
# that ships with the OS (no Node, no Xcode command line tools).

require 'json'
require 'open3'
require 'set'      # the Ruby that ships with macOS (2.6) does not load Set on its own

Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

ROOT   = ENV['VIRI_ROOT'] || File.expand_path('..', __dir__)   # VIRI_ROOT: point at a copy, for testing the checks
SITE   = File.join(ROOT, 'dist-elevated')
JSC    = '/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc'
JS     = %w[app.js db.js explore-data.js]
CACHED = %w[app.js db.js explore-data.js styles.css]

$failed = 0
$warned = 0
def ok(msg)   puts "  ok    #{msg}" end
def warn(msg) $warned += 1; puts "  WARN  #{msg}" end
def fail(msg) $failed += 1; puts "  FAIL  #{msg}" end
def head(t)   puts "\n#{t}" end
def read(name) File.read(File.join(SITE, name), encoding: 'UTF-8') end
def line_of(s, i) s[0, i].count("\n") + 1 end
# true when position i sits inside a /* */ comment or after // on its line
def in_comment?(s, i)
  open = s.rindex('/*', i); close = s.rindex('*/', i)
  return true if open && (close.nil? || close < open)
  line_start = s.rindex("\n", i) || 0
  !!(s[line_start...i] =~ %r{(^|[^:'"`])//})
end

# Read the live copy through the GitHub API, not raw.githubusercontent.com: the
# raw host caches for minutes, so straight after a deploy it served the previous
# version and the cache-stamp check passed when it should have failed.
TOKEN_FILE = File.expand_path('~/.config/viri/gh_token.txt')
def live(name)
  @live ||= {}
  return @live[name] if @live.key?(name)
  args = ['curl', '-sf', '-m', '20', '-H', 'Accept: application/vnd.github.raw']
  args += ['-H', "Authorization: token #{File.read(TOKEN_FILE).strip}"] if File.exist?(TOKEN_FILE)
  args << "https://api.github.com/repos/Vitality-Ritual/ViRi/contents/#{name}?ref=gh-pages"
  out, _err, st = Open3.capture3(*args)
  @live[name] = st.success? ? out.force_encoding('UTF-8') : nil
end

def stamp!
  path = File.join(SITE, 'index.html')
  s = File.read(path, encoding: 'UTF-8')
  now = Time.now.strftime('%Y%m%d%H%M')
  n = s.scan(/\?v=\d+/).length
  File.write(path, s.gsub(/\?v=\d+/) { "?v=#{now}" })
  puts "re-stamped #{n} asset URLs in index.html to ?v=#{now}"
end

stamp! if ARGV.include?('--stamp')
# names removed on purpose; anything else that disappears still fails
REMOVED = ARGV.map { |a| a[/\A--removed=(.+)\z/, 1] }.compact.flat_map { |v| v.split(',') }.map(&:strip)

# ------------------------------------------------------------------ syntax
head 'syntax'
if File.executable?(JSC)
  JS.each do |f|
    out, _err, _st = Open3.capture3(JSC, '-e',
      "try { checkSyntax(#{File.join(SITE, f).to_json}); print('OK'); } catch (e) { print('ERR ' + e); }")
    out.start_with?('OK') ? ok(f) : fail("#{f}: #{out.strip}")
  end
else
  warn "JavaScriptCore shell not found at #{JSC}; syntax not checked"
end

# ------------------------------------------------------------------ functions
# Top-level `function x`, `async function x` and `const x=`. explore-data.js is
# wrapped in one function, so its top level is indented two spaces.
def inventory(src, indent = 0)
  pad = indent.zero? ? '' : " {#{indent}}"
  src.scan(/^#{pad}(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^#{pad}(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/)
     .map(&:compact).flatten.uniq
end

head 'functions (against the live site)'
JS.each do |f|
  remote = live(f)
  if remote.nil?
    warn "#{f}: could not fetch the live copy, so nothing to compare against"
    next
  end
  indent = f == 'explore-data.js' ? 2 : 0
  mine = inventory(read(f), indent)
  theirs = inventory(remote, indent)
  gone = theirs - mine - REMOVED
  meant = (theirs - mine) & REMOVED
  puts "  note  #{f}: removed on purpose: #{meant.join(', ')}" unless meant.empty?
  added = mine - theirs
  if gone.empty?
    ok "#{f}: #{mine.length} top-level names, none missing" + (added.empty? ? '' : " (#{added.length} new: #{added.first(6).join(', ')}#{added.length > 6 ? ', …' : ''})")
  else
    fail "#{f}: on the live site but missing here: #{gone.join(', ')}. If that is deliberate, rerun with --removed=#{gone.join(',')}; if not, a scripted edit ate it."
  end
  shrink = 1.0 - read(f).length.to_f / remote.length
  warn "#{f} is #{(shrink * 100).round(1)}% smaller than the live copy. Check nothing was deleted by accident." if shrink > 0.03
end

# ------------------------------------------------------------------ writes
head 'writes (row-level security)'
db = read('db.js')
writes = 0
unwrapped = 0
db.to_enum(:scan, /\.from\(\s*(['"`])[\w.]+\1\s*\)\s*\.(update|delete)\(/m).each do
  m = Regexp.last_match
  writes += 1
  before = db[[m.begin(0) - 60, 0].max...m.begin(0)]
  next if before =~ /written\(\s*\w+\s*\z/m
  unwrapped += 1
  fail "db.js:#{line_of(db, m.begin(0))} #{m[2]} does not go through written(). An RLS-blocked #{m[2]} would report success."
end
# a write this check cannot see, e.g. .from(someVariable), is a write it cannot vouch for
raw = db.scan(/\.(?:update|delete)\(/).length
if raw > writes
  unwrapped += 1
  fail "db.js has #{raw} .update(/.delete( calls but only #{writes} on c.from('a_table'). Name the table literally so this check can see the write."
end
ok "db.js: #{writes} updates and deletes, all through written()" if unwrapped.zero?

app = read('app.js')
app.to_enum(:scan, /\.from\(\s*['"`]\w+['"`]\s*\)\s*\.(insert|update|upsert|delete)\(/).each do
  m = Regexp.last_match
  fail "app.js:#{line_of(app, m.begin(0))} writes to the database directly. Writes belong in db.js, where they are checked."
end

# ------------------------------------------------------------------ handlers
# Every button is wired by a `case 'some-action':someFunction(...)` in one big
# dispatcher. The "Show my age" switch called toggleShowAge for as long as anyone
# can tell, a function that was never written, so pressing it threw and did
# nothing. A call to a name defined nowhere is caught here instead of by a member.
head 'handlers (every button calls something that exists)'
defined = (inventory(app) + inventory(read('db.js')) + inventory(read('explore-data.js'), 2)).to_set
undefined_calls = []
app.scan(/case\s+'([\w-]+)'\s*:\s*(?:\{\s*)?(?:[\w$.]+\s*=\s*)?(?:await\s+)?([A-Za-z_$][\w$]*)\s*\(/).each do |action, fn|
  next if defined.include?(fn)
  next if %w[if for while switch return typeof closeModal render toast goTo save setTimeout confirm alert].include?(fn)
  next if fn =~ /\A(?:Math|Object|Array|JSON|Number|String|Date|Promise|history|location|window|document|localStorage|navigator|console)\z/
  undefined_calls << [action, fn]
end
undefined_calls.uniq.each { |action, fn| fail "button '#{action}' calls #{fn}(), which is defined nowhere" }
ok "all #{app.scan(/case\s+'[\w-]+'\s*:/).length} dispatcher cases call functions that exist" if undefined_calls.empty?

# Buttons that need an account are listed in NEEDS_ACCOUNT, and the dispatcher sends a
# visitor without one to sign-up before the switch runs. A name in that list with no
# case behind it is stale; a gate that is not applied protects nothing.
set = app[/const NEEDS_ACCOUNT=new Set\(\[(.*?)\]\)/m, 1]
if set.nil?
  fail 'NEEDS_ACCOUNT is missing, so signed-out visitors can open account-only forms'
else
  listed = set.scan(/'([\w-]+)'/).flatten
  cases = app.scan(/case\s+'([\w-]+)'\s*:/).flatten
  stale = listed - cases
  stale.each { |n| fail "NEEDS_ACCOUNT lists '#{n}', which no button handles" }
  fail 'the click dispatcher no longer checks NEEDS_ACCOUNT before its switch' unless app.include?('NEEDS_ACCOUNT.has(action)&&authSettled&&!signedIn()')
  ok "#{listed.length} account-only buttons all go to sign-up when signed out" if stale.empty? && app.include?('NEEDS_ACCOUNT.has(action)')
end

# ------------------------------------------------------------------ roster
head 'roster (sample members)'
roster_bad = 0
app.to_enum(:scan, /VIRI\.people/).each do
  i = Regexp.last_match.begin(0)
  next if in_comment?(app, i)
  line = app.lines[line_of(app, i) - 1]
  next if line =~ /^const exPerson\s*=/
  roster_bad += 1
  fail "app.js:#{line_of(app, i)} reads VIRI.people directly. Use personById(), which looks at real members first."
end
app.to_enum(:scan, /\bexPerson\(/).each do
  i = Regexp.last_match.begin(0)
  next if in_comment?(app, i)
  line = app.lines[line_of(app, i) - 1]
  next if line =~ /^const personById\s*=/
  roster_bad += 1
  fail "app.js:#{line_of(app, i)} calls exPerson(), which only knows the sample roster. Use personById()."
end
ok 'only personById() reaches the sample roster' if roster_bad.zero?

# ------------------------------------------------------------------ venues
head 'venues'
if File.executable?(JSC)
  probe = <<~JS
    var window = {};
    load(#{File.join(SITE, 'explore-data.js').to_json});
    var V = window.VIRI, seen = {}, dup = [], bad = [];
    var cities = {}; V.cities.forEach(function (c) { cities[c.id] = c; });
    V.venues.forEach(function (v) {
      if (seen[v.id]) dup.push(v.id); seen[v.id] = 1;
      var c = cities[v.city];
      if (!c) { bad.push(v.id + ': unknown city ' + v.city); return; }
      if (V.categories.indexOf(v.cat) < 0) bad.push(v.id + ': category ' + v.cat + ' is not in CATS');
      if (!v.brand || !v.area) bad.push(v.id + ': missing brand or area');
      if (!isFinite(v.lon) || !isFinite(v.lat)) { bad.push(v.id + ': no coordinates'); return; }
      var lon = 0, lat = 0; c.areas.forEach(function (a) { lon += a.lon; lat += a.lat; });
      lon /= c.areas.length; lat /= c.areas.length;
      if (Math.abs(v.lon - lon) > 0.6 || Math.abs(v.lat - lat) > 0.6)
        bad.push(v.id + ': ' + v.lat + ', ' + v.lon + ' is a long way from ' + c.name + ' (lon/lat swapped, or the wrong city?)');
    });
    print(JSON.stringify({ n: V.venues.length, dup: dup, bad: bad }));
  JS
  out, err, _st = Open3.capture3(JSC, '-e', probe)
  begin
    r = JSON.parse(out)
    r['dup'].each { |d| fail "duplicate venue id #{d}" }
    r['bad'].each { |b| fail b }
    ok "#{r['n']} venues, ids unique, every one in its city and category" if r['dup'].empty? && r['bad'].empty?
  rescue JSON::ParserError
    fail "explore-data.js did not load: #{(out + err).strip[0, 300]}"
  end
else
  warn 'venues not checked (no JavaScriptCore shell)'
end

# ------------------------------------------------------------------ cache
head 'cache stamps'
index = read('index.html')
stamps = index.scan(/\?v=(\d+)/).flatten.uniq
if stamps.length != 1
  fail "index.html carries #{stamps.length} different ?v= stamps (#{stamps.join(', ')}); they should all match. Run with --stamp."
else
  live_index = live('index.html')
  if live_index.nil?
    warn 'could not fetch the live index.html, so cannot tell whether a re-stamp is needed'
  else
    live_stamp = live_index[/\?v=(\d+)/, 1]
    changed = CACHED.select { |f| (l = live(f)) && l != read(f) }
    if changed.any? && stamps.first == live_stamp
      fail "#{changed.join(', ')} changed but ?v= is still #{live_stamp}, the live stamp. Browsers will keep the old files. Run: ruby tools/check.rb --stamp"
    elsif changed.any?
      ok "#{changed.join(', ')} changed, and ?v=#{stamps.first} is new (live is #{live_stamp})"
    else
      ok 'no cached file differs from the live site'
    end
  end
end

# ------------------------------------------------------------------ summary
puts
if $failed.zero?
  puts "PASS#{$warned.zero? ? '' : " with #{$warned} warning#{$warned == 1 ? '' : 's'}"}. Safe to deploy."
  puts 'Then open the site, hard-refresh (Cmd+Shift+R), and run tools/sweep.js in the console.'
  exit 0
else
  puts "#{$failed} check#{$failed == 1 ? '' : 's'} FAILED. Do not deploy."
  exit 1
end
