# encoding: utf-8
# Adds new subscribers to the Resend "General" segment. It only ever ADDS contacts: it never sends
# anything, never edits an existing contact, and never re-adds someone who has unsubscribed.
#
#   ruby tools/sync-to-resend.rb person@example.com other@example.com
#   ruby tools/sync-to-resend.rb --dry-run person@example.com     # shows what it would do
#
# Emails come from the twice-daily check: the Substack subscriber list and the site's `subscribers`
# table in Supabase (both need a logged-in browser, so the check reads them there and passes them in).
# The Resend key is read from ~/.config/viri/resend_key.txt and never printed.
require 'net/http'
require 'json'
require 'time'

KEY = File.read(File.expand_path('~/.config/viri/resend_key.txt')).strip
SEGMENT_NAME = 'General'
LOG = File.expand_path('../growth/resend-sync-log.txt', __dir__)

def api(method, path, body = nil)
  uri = URI("https://api.resend.com#{path}")
  3.times do |i|
    res = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 20, read_timeout: 60) do |h|
      req = Net::HTTP.const_get(method.capitalize).new(uri)
      req['Authorization'] = "Bearer #{KEY}"
      req['Content-Type'] = 'application/json'
      req.body = JSON.generate(body) if body
      h.request(req)
    end
    if res.code == '429' && i < 2
      sleep 2 * (i + 1)
      next
    end
    return [res.code.to_i, (JSON.parse(res.body) rescue { 'raw' => res.body[0, 200] })]
  end
end

dry = ARGV.delete('--dry-run')
wanted = ARGV.flat_map { |a| a.split(/[\s,;]+/) }.map { |e| e.strip.downcase }.reject(&:empty?).uniq
bad = wanted.reject { |e| e =~ /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/ }
wanted -= bad
abort 'no emails given' if wanted.empty? && bad.empty?

code, segs = api(:get, '/segments')
abort "could not read segments (#{code})" unless code == 200
seg = segs['data'].find { |s| s['name'] == SEGMENT_NAME } or abort "segment #{SEGMENT_NAME} not found"

have = {}
after = nil
loop do
  code, page = api(:get, "/contacts?limit=100#{after ? "&after=#{after}" : ''}")
  abort "could not read contacts (#{code})" unless code == 200
  page['data'].each { |c| have[c['email'].downcase] = c }
  break unless page['has_more'] && !page['data'].empty?
  after = page['data'].last['id']
end

added = []
skipped = []
failed = []
wanted.each do |email|
  if (c = have[email])
    skipped << "#{email} (#{c['unsubscribed'] ? 'unsubscribed, left alone' : 'already in Resend'})"
    next
  end
  if dry
    added << "#{email} (dry run)"
    next
  end
  code, res = api(:post, '/contacts', { email: email, unsubscribed: false, segments: [{ id: seg['id'] }] })
  if code.between?(200, 299) && res['id']
    added << email
  else
    failed << "#{email} (#{code} #{res.inspect[0, 120]})"
  end
  sleep 0.6
end

line = "#{Time.now.strftime('%Y-%m-%d %H:%M')} added=#{added.size} skipped=#{skipped.size} failed=#{failed.size} invalid=#{bad.size}"
puts line
added.each { |e| puts "  added: #{e}" }
skipped.each { |e| puts "  skipped: #{e}" }
failed.each { |e| puts "  FAILED: #{e}" }
bad.each { |e| puts "  invalid: #{e}" }
unless dry
  File.open(LOG, 'a') { |f| f.puts(line + (added.empty? ? '' : "  [#{added.size} new]")) }
end
exit(failed.empty? ? 0 : 1)
