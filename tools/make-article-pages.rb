# encoding: utf-8
# Real addresses for every article: website/read/<id>/index.html, plus sitemap.xml and robots.txt.
#
# Why: the app's pages live after a "#", which Pinterest, Google and link previews ignore,
# so every article looked like the home page to them. Each generated page is the normal
# site shell with the article's own title, description and image in <head>; a one-line
# script then moves the address to /#/read/<id> (keeping ?from=...) before the app starts,
# so the app runs exactly as it does today. It is not a redirect, so Google keeps the
# /read/<id>/ address and indexes what the app draws there.
#
# Run AFTER `ruby tools/check.rb --stamp` (the pages copy the new cache stamps from
# index.html) and deploy the files it lists:
#   ruby tools/make-article-pages.rb
require 'cgi'
require 'fileutils'
ROOT = File.expand_path('..', __dir__)
WEB = File.join(ROOT, 'website')
SITE = 'https://vitalityritual.org'

src = File.read(File.join(WEB, 'app.js'), encoding: 'utf-8')
list = src[src.index('const articles=[')..]
list = list[0, list.index("\n];") || list.size]
arts = list.scan(/\{id:'([^']+)'.*?title:'([^']+)'.*?date:'([^']+)',desc:'([^']+)'/m).map do |id, title, date, desc|
  { id: id, title: title, date: date, desc: desc }
end
abort 'no articles found' if arts.empty?

# Pin copy is longer and written for search, so it makes the better description.
pin_desc = {}
pin_img = {}
pins_file = File.join(ROOT, 'pinterest', 'pins-data.rb')
if File.exist?(pins_file)
  require pins_file
  PINS.each_with_index do |p, i|
    pin_desc[p[:a]] ||= p[:desc]
    pin_img[p[:a]] ||= format('pin-%02d', i + 1)
  end
end

shell = File.read(File.join(WEB, 'index.html'), encoding: 'utf-8')
abort 'index.html has no <title>' unless shell =~ /<title>.*?<\/title>/m
h = ->(s) { CGI.escapeHTML(s.to_s) }
out = []

FileUtils.mkdir_p(File.join(WEB, 'assets', 'og'))
arts.each do |a|
  # share image: the article's first pin (her own design), never a Pinterest photo
  og_rel = nil
  if (pin = pin_img[a[:id]])
    png = File.join(ROOT, 'pinterest', 'out', "#{pin}.png")
    if File.exist?(png)
      og_rel = "assets/og/#{a[:id]}.jpg"
      dst = File.join(WEB, og_rel)
      unless File.exist?(dst) && File.mtime(dst) >= File.mtime(png)
        system('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', '-Z', '1200', png, '--out', dst, out: File::NULL)
      end
      out << "website/#{og_rel}"
    end
  end
  desc = pin_desc[a[:id]] || a[:desc]
  url = "#{SITE}/read/#{a[:id]}/"
  meta = [
    %(<base href="/">),
    %(<title>#{h.(a[:title])} — The VIRI Edit</title>),
    %(<meta name="description" content="#{h.(desc)}">),
    %(<link rel="canonical" href="#{url}">),
    %(<meta property="og:type" content="article">),
    %(<meta property="og:site_name" content="The VIRI Edit">),
    %(<meta property="og:title" content="#{h.(a[:title])}">),
    %(<meta property="og:description" content="#{h.(desc)}">),
    %(<meta property="og:url" content="#{url}">),
    og_rel ? %(<meta property="og:image" content="#{SITE}/#{og_rel}">) : nil,
    %(<meta property="article:published_time" content="#{a[:date]}">),
    %(<meta name="twitter:card" content="summary_large_image">),
    # move to the app's own address before app.js runs; ?from= stays in front of the #
    %(<script>history.replaceState(null,'','/'+location.search+'#/read/#{a[:id]}');</script>),
  ].compact.join
  page = shell.sub(/<title>.*?<\/title>/m) { meta }
                .sub(/<meta name="description" content="[^"]*">/) { '' }
  dir = File.join(WEB, 'read', a[:id])
  FileUtils.mkdir_p(dir)
  File.write(File.join(dir, 'index.html'), page)
  out << "website/read/#{a[:id]}/index.html"
end

urls = ["#{SITE}/"] + arts.map { |a| "#{SITE}/read/#{a[:id]}/" }
sitemap = %(<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n) +
  urls.map { |u| "  <url><loc>#{u}</loc></url>" }.join("\n") + "\n</urlset>\n"
File.write(File.join(WEB, 'sitemap.xml'), sitemap)
File.write(File.join(WEB, 'robots.txt'), "User-agent: *\nAllow: /\n\nSitemap: #{SITE}/sitemap.xml\n")
out += %w[website/sitemap.xml website/robots.txt]
puts "#{arts.size} article pages"
puts out.join(' ')
