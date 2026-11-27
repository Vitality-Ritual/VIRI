# encoding: utf-8
# Batch 10 (27 Nov 2026): re-designs of six scheduled pins whose GRAPHIC listed the article's contents
# (pins 85, 86, 88, 90, 94, 97). Same titles, links, boards and times as before; new graphics with no lists.
# Output: out/pin-NN-v2.png, website/pins/pin-NN-v2.jpg, batch10-fixes.csv, batch10-fixes-sheet.png
#   ruby pinterest/batch10-fixes.rb
require 'csv'
require 'time'
src = File.read(File.join(__dir__, 'make-pins.rb'), encoding: 'UTF-8')
eval(src[0...src.index('only = ARGV')].sub("require_relative 'pins-data'", "require File.join(__dir__, 'pins-data')").gsub('__dir__', "'#{__dir__}'"), binding, File.join(__dir__, 'make-pins.rb'))
WEB = File.join(ROOT, 'website')
ET = ->(y, m, d, h, mi = 0) { Time.utc(y, m, d, h + 5, mi) }
FIX = [
  { n: 85, a: 'holiday-gift-guide', t: :number, pal: :oat, tl: 'Holiday Gift Guide', num: '3', caps: 'GIFT IDEAS', script: 'for the gym girl', sub: 'whose favorite room is the weight room',
    board: :faves, title: 'Gift Ideas for the Gym Girl in Your Life', at: ET[2026, 11, 27, 18],
    desc: 'Gift ideas for the gym girl in your life, picked by a gym girl. The full list is in the VIRI holiday gift guide.' },
  { n: 86, a: 'holiday-gift-guide', t: :framed, pal: :sand, tl: 'Holiday Gift Guide', head: ['Gifts for the', 'Walking Girl'], script: '10,000 steps a day, every day',
    sub: 'three ideas from the VIRI holiday gift guide', board: :faves, title: 'Gifts for Your Friend Who Walks 10,000 Steps a Day', at: ET[2026, 11, 28, 9],
    desc: 'Gift ideas for the friend who never skips her morning walk. More in the VIRI holiday gift guide.' },
  { n: 88, a: 'holiday-gift-guide', t: :framed, pal: :cream, tl: 'Holiday Gift Guide', head: ['The Quick', 'List'], script: 'gifts for the fitness girl',
    sub: 'ten ideas in the full guide', board: :faves, title: 'Holiday Gift Guide for the Fitness Girl: The Quick List', at: ET[2026, 11, 29, 9],
    desc: 'The quick version of the VIRI holiday gift guide for the fitness girl on your list. Ten ideas in the full guide.' },
  { n: 90, a: 'printable', link: 'printable/', t: :number, pal: :oat, tl: 'Free printable', num: '5', caps: 'SMALL THINGS', script: 'for a December reset', sub: 'thirty small habits, free',
    board: :arc, title: 'December Reset Checklist (Free Printable)', at: ET[2026, 11, 30, 9],
    desc: 'A December reset checklist to end the year calm, not burnt out. From a free 3-page winter printable.' },
  { n: 94, a: 'winter-arc-planner', t: :framed, pal: :cocoa, tl: 'Winter arc', head: ['How to', 'Not Quit'], titlesize: 120, script: 'your winter arc in January',
    sub: 'a free planner inside', board: :arc, title: 'How to Stick to Your Winter Arc Through January', at: ET[2026, 12, 2, 9],
    desc: 'How to keep your winter arc going past the holidays and through January. Free planner inside.' },
  { n: 97, a: 'corporate-burnout', t: :framed, pal: :sand, tl: 'End-of-year burnout', head: ['When Work Is', 'Everything'], script: 'two things that helped me',
    sub: 'a passion and a morning routine are not the answer you think', board: :career, title: 'Corporate Burnout in Your 20s: Two Things That Helped Me', at: ET[2026, 12, 3, 18],
    desc: 'If your whole day revolves around your 9-to-5, start here. The two things that helped me most.' },
]
FIX.last[:sub] = 'end-of-year burnout from a 9-to-5'
rows = []; sheet = []
FIX.each do |p|
  base = File.join(OUT, "pin-#{p[:n]}-v2")
  File.write("#{base}.html", head + send("t_#{p[:t]}", p) + "</body></html>\n")
  system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=7000',
         '--window-size=1000,1500', "--screenshot=#{base}.png", "file://#{base}.html", out: File::NULL, err: File::NULL)
  system('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '86', "#{base}.png", '--out', File.join(WEB, 'pins', "pin-#{p[:n]}-v2.jpg"), out: File::NULL)
  path = p[:link] || "read/#{p[:a]}/"
  rows << [p[:title][0, 100], "https://vitalityritual.org/pins/pin-#{p[:n]}-v2.jpg", BOARDS[p[:board]], '', p[:desc][0, 500],
           "https://vitalityritual.org/#{path}?from=pinterest&pin=#{p[:n]}", p[:at].strftime('%Y-%m-%dT%H:%M:%S'), '']
  sheet << %(<figure><img src="file://#{base}.png" width=400><figcaption>#{p[:n]} · #{(p[:at] - 5 * 3600).strftime('%a %b %-d, %-l:%M %p')}</figcaption></figure>)
end
CSV.open(File.join(__dir__, 'batch10-fixes.csv'), 'w') do |csv|
  csv << ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']
  rows.each { |r| csv << r }
end
File.write(File.join(__dir__, 'batch10-fixes-sheet.html'), %(<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;width:1260px;background:#efe9e1;font-family:Georgia;display:grid;grid-template-columns:repeat(3,400px);gap:20px;padding:20px}figure{margin:0}figcaption{padding:6px 0;font-size:16px}</style></head><body>#{sheet.join}</body></html>))
system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', '--allow-file-access-from-files', '--window-size=1300,1320',
       "--screenshot=#{File.join(__dir__, 'batch10-fixes-sheet.png')}", "file://#{File.join(__dir__, 'batch10-fixes-sheet.html')}", out: File::NULL, err: File::NULL)
puts "ok #{FIX.size}"
