# encoding: utf-8
# Writes website/substack-feed.xml: an RSS feed of the VIRI Edit articles, full
# text and cover photo, for Substack's "Import posts". Annabel Green's article is
# left out. Re-run after adding an article:  ruby substack/make-feed.rb
#
# Substack makes each post's address from the item's <link> path and skips an item
# whose address already exists, so every link needs its own path (/read/<id>, not
# /#/read/<id>, which all collapse to "/"). To leave out posts already imported:
#   ALSO_SKIP=september-reset,corporate-burnout ruby substack/make-feed.rb
require 'cgi'
require 'time'
ROOT = File.expand_path('..', __dir__)
SITE = 'https://vitalityritual.org/'
SKIP = %w[office-dressing] + ENV.fetch('ALSO_SKIP', '').split(',')
src = File.read(File.join(ROOT, 'website/app.js'), encoding: 'utf-8')
list = src[/const articles=\[(.*?)\n\];/m, 1] or abort 'articles not found'
arts = list.split(/\n\s*(?=\{id:')/).map { |c|
  c = c.strip
  next unless c.start_with?('{id:')
  f = ->(k) { c[/#{k}:'((?:[^'\\]|\\.)*)'/, 1].to_s.gsub("\\'", "'") }
  { id: f.('id'), category: f.('category'), title: f.('title'), img: f.('img'), author: f.('author'),
    date: f.('date'), desc: f.('desc'), body: c[/body:`(.*?)`\}/m, 1].to_s.gsub('${A}', SITE + 'assets/')
          .gsub(%r{<div class="prose-pair">(.*?)</div>}m, '\\1') } # Substack has no side-by-side images
}.compact.reject { |a| SKIP.include?(a[:id]) }.sort_by { |a| a[:date] }
x = ->(s) { CGI.escapeHTML(s) }
items = arts.map { |a|
  t = Time.new(*a[:date].split('-').map(&:to_i), 9, 0, 0, '-04:00')
  img = SITE + 'assets/' + a[:img]
  html = %(<p><img src="#{img}" alt="#{x.(a[:title])}"></p>) + a[:body] +
         %(<p><em>This story first appeared on <a href="#{SITE}#/read/#{a[:id]}">vitalityritual.org</a>.</em></p>)
  <<~ITEM
    <item>
      <title>#{x.(a[:title])}</title>
      <link>#{SITE}read/#{a[:id]}</link>
      <guid isPermaLink="false">viri-#{a[:id]}</guid>
      <pubDate>#{t.rfc2822}</pubDate>
      <dc:creator>#{x.(a[:author])}</dc:creator>
      <category>#{x.(a[:category])}</category>
      <description>#{x.(a[:desc])}</description>
      <enclosure url="#{img}" type="image/#{a[:img].end_with?('.webp') ? 'webp' : 'jpeg'}" length="0"/>
      <content:encoded><![CDATA[#{html}]]></content:encoded>
    </item>
  ITEM
}.join
xml = <<~XML
  <?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>The VIRI Edit</title>
    <link>#{SITE}#/read</link>
    <description>Life outside the inbox.</description>
    <language>en-us</language>
  #{items}</channel>
  </rss>
XML
File.write(File.join(ROOT, 'website/substack-feed.xml'), xml)
puts "substack-feed.xml: #{arts.size} articles: #{arts.map { |a| a[:id] }.join(', ')}"
