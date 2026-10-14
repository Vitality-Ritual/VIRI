# Ship the site: push the built files to gh-pages (what vitalityritual.org serves)
# and the same files, plus tools/ and any named migrations, to main.
#
#   ruby tools/check.rb --stamp          # must say PASS first
#   ruby tools/deploy.rb "Commit message" [supabase/030-....sql ...]
#
# No git on this Mac, so this talks to the GitHub Git Data API directly
# (blobs -> tree -> commit -> move the branch). The token is read from
# ~/.config/viri/gh_token.txt and never printed.
require 'net/http'
require 'json'
require 'base64'

REPO = 'Vitality-Ritual/ViRi'
ROOT = File.expand_path('..', __dir__)               # project/
SITE = %w[app.js db.js explore-data.js styles.css index.html]
TOKEN = File.read(File.expand_path('~/.config/viri/gh_token.txt')).strip

def api(method, path, body = nil, tries = 4)
  uri = URI("https://api.github.com/repos/#{REPO}#{path}")
  tries.times do |i|
    begin
      Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 20, read_timeout: 90) do |h|
        req = Net::HTTP.const_get(method.capitalize).new(uri)
        req['Authorization'] = "Bearer #{TOKEN}"
        req['Accept'] = 'application/vnd.github+json'
        req['Content-Type'] = 'application/json'
        req.body = JSON.generate(body) if body
        res = h.request(req)
        raise "#{method.upcase} #{path}: #{res.code} #{res.body[0, 300]}" unless res.code.start_with?('2')
        return JSON.parse(res.body)
      end
    rescue Net::ReadTimeout, Net::OpenTimeout, Errno::ECONNRESET, OpenSSL::SSL::SSLError => e
      raise if i == tries - 1
      sleep 3 * (i + 1)
    end
  end
end

def push(branch, files, message)
  head = api(:get, "/git/ref/heads/#{branch}")['object']['sha']
  base = api(:get, "/git/commits/#{head}")['tree']['sha']
  tree = files.map do |path, local|
    blob = api(:post, '/git/blobs', { content: Base64.strict_encode64(File.binread(local)), encoding: 'base64' })
    { path: path, mode: '100644', type: 'blob', sha: blob['sha'] }
  end
  t = api(:post, '/git/trees', { base_tree: base, tree: tree })
  return puts("#{branch}: nothing changed") if t['sha'] == base
  c = api(:post, '/git/commits', { message: message, tree: t['sha'], parents: [head] })
  api(:patch, "/git/refs/heads/#{branch}", { sha: c['sha'] })
  puts "#{branch}: #{head[0, 7]} -> #{c['sha'][0, 7]}  (#{files.size} files)"
  c['sha']
end

message = ARGV[0] or abort 'usage: ruby tools/deploy.rb "message" [extra project files...]'
extras = ARGV[1..] || []
extras.each { |f| abort "missing #{f}" unless File.file?(File.join(ROOT, f)) }

site = SITE.to_h { |f| [f, File.join(ROOT, 'dist-elevated', f)] }
pages_sha = push('gh-pages', site, message)

main = SITE.to_h { |f| ["dist-elevated/#{f}", File.join(ROOT, 'dist-elevated', f)] }
Dir[File.join(ROOT, 'tools', '*')].select { |f| File.file?(f) }.each { |f| main["tools/#{File.basename(f)}"] = f }
extras.each { |f| main[f] = File.join(ROOT, f) }
push('main', main, message)

if pages_sha
  12.times do
    sleep 15
    b = api(:get, '/pages/builds/latest')
    if b['status'] != 'building' && b['status'] != 'queued'
      puts "pages build: #{b['status']} (commit #{b['commit'].to_s[0, 7]}#{b['commit'] == pages_sha ? ', matches' : ', NOT the one just pushed'})"
      break
    end
  end
end
