# encoding: utf-8
# Pinterest batch 4 (17 Nov 2026): pins 99-105 for Confessions of a Type A Girl, one a day 12:30 ET Nov 18-24.
# Uses the templates in make-pins.rb. Output: out/pin-99..105.png, website/pins/*.jpg, batch4.csv, batch4-sheet.png
#   ruby pinterest/batch4.rb
require 'csv'
require 'time'
src = File.read(File.join(__dir__, 'make-pins.rb'), encoding: 'UTF-8')
eval(src[0...src.index('only = ARGV')].sub("require_relative 'pins-data'", "require File.join(__dir__, 'pins-data')").gsub('__dir__', "'#{__dir__}'"), binding, File.join(__dir__, 'make-pins.rb'))
WEB = File.join(ROOT, 'website')
ET = ->(y, m, d, h, mi = 0) { Time.utc(y, m, d, h + 5, mi) }   # EST -> UTC

IMG = '/Users/margaretcole/Desktop/ViRi/project/articles/type-a/'
def t_image(p)
  c = PAL[p[:pal]]
  <<-H
<div class="pin" style="padding:64px 56px 56px;background:#{c[:bg]};color:#{c[:fg]};justify-content:space-between;text-align:center">
 <div>
  <div class="cap" style="color:#{c[:dim]}">#{p[:tl]}</div>
  <div class="garamond" style="font-style:italic;font-size:46px;line-height:1.25;margin:26px auto 0;max-width:800px">#{p[:head]}</div>
 </div>
 <img src="file://#{IMG}#{p[:img]}" style="width:100%;display:block;border:1px solid #{c[:rule]}">
 <div class="cap" style="color:#{c[:dim]}">#{p[:fl]}</div>
</div>
  H
end

B3 = [
  { a: 'type-a-confessions', t: :split, top: :espresso, bottom: :cream, tl: 'The Reset', caps: ['CONFESSIONS', 'OF A TYPE A GIRL'], script: 'part one',
    sub: 'what happens when your plan only works on a perfect day', board: :wellness,
    title: 'Confessions of a Type A Girl: When Your Plan Only Works on a Perfect Day', at: ET[2026, 11, 18, 12, 30],
    desc: 'Marathons, 5 a.m. alarms and a list for everything. What happened when my hour-by-hour winter arc schedule met real life, and the two changes that made it realistic.' },
  { a: 'type-a-confessions', t: :image, pal: :cream, tl: 'Save this schedule', head: 'The original plan vs. the one that actually works',
    img: 'type-a-schedule.png', fl: 'Read Part 1 at vitalityritual.org', board: :arc,
    title: 'A Realistic Winter Arc Schedule: My Original Plan vs. the Revised One', at: ET[2026, 11, 19, 12, 30],
    desc: 'My hour-by-hour winter arc schedule next to the revised version: a wake-up range, one flex block each evening and weekly goals instead of daily ones. A realistic daily routine for a 9-to-5.' },
  { a: 'type-a-confessions', t: :quote, pal: :cocoa, tl: 'Type A', quote: 'My plan for success only worked on a perfect day.',
    from: 'Confessions of a Type A Girl', board: :wellness, title: 'For the Type A Girl: Your Plan Shouldn’t Need a Perfect Day', at: ET[2026, 11, 20, 12, 30],
    desc: 'If your schedule only works when nothing goes wrong, it’s the schedule, not you. How I gave my Type A plans some breathing room.' },
  { a: 'type-a-confessions', t: :list, pal: :oat, tl: 'Type A tips', script: 'a schedule with', big: 'BREATHING ROOM', sub: 'for the Type A girl',
    items: ['Give each day a range, not a rulebook', 'Two of four priorities is a good day', 'Set weekly goals, not daily ones', 'After a late night, sleep wins'],
    board: :wellness, title: 'How to Build a Schedule With Breathing Room (for Type A People)', at: ET[2026, 11, 21, 12, 30],
    desc: 'Four ways to make an ambitious schedule realistic: give each day a range, count two of four priorities as a good day, set weekly goals and let sleep win after a late night.' },
  { a: 'type-a-confessions', t: :image, pal: :oat, tl: 'Are you Type A?', head: 'Five signs you might be Type A',
    img: 'type-a-traits.png', fl: 'Confessions of a Type A Girl · vitalityritual.org', board: :wellness,
    title: 'Type A Personality Traits: 5 Signs You’re Type A', at: ET[2026, 11, 22, 12, 30],
    desc: 'The five Type A personality traits: driven and ambitious, time urgent, competitive, high control and multitasking, and a higher stress risk. Plus what being Type A looks like in real life.' },
  { a: 'type-a-confessions', t: :number, pal: :sand, tl: 'Productivity', num: '2', caps: 'OUT OF 4', script: 'is a good day', sub: 'a realistic approach to a busy week',
    board: :career, title: 'Productivity Tip for Overachievers: Two Out of Four Is a Good Day', at: ET[2026, 11, 23, 12, 30],
    desc: 'Working a 9-to-5 and juggling workouts, a side project and classes? Stop expecting every priority every day. Two out of four is a good day, and all four is a bonus.' },
  { a: 'type-a-confessions', t: :framed, pal: :cream, tl: 'Goal setting', head: ['Weekly Goals,', '<i>Not Daily Ones</i>'], script: 'for the overachiever',
    sub: 'How I made my winter arc realistic', board: :arc,
    title: 'Set Weekly Goals, Not Daily Ones: A Realistic Winter Arc', at: ET[2026, 11, 24, 12, 30],
    desc: 'Daily goals turn one missed day into a pile-up. Weekly goals like five workouts or five hours of coursework fit around travel, meetings and late nights.' },
]

rows = []
sheet = []
B3.each_with_index do |p, i|
  n = 99 + i
  base = File.join(OUT, "pin-#{n}")
  File.write("#{base}.html", head + send("t_#{p[:t]}", p) + "</body></html>\n")
  system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=7000',
         '--allow-file-access-from-files', '--window-size=1000,1500', "--screenshot=#{base}.png", "file://#{base}.html", out: File::NULL, err: File::NULL)
  system('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '86', "#{base}.png", '--out', File.join(WEB, 'pins', "pin-#{n}.jpg"), out: File::NULL)
  path = p[:link] || "read/#{p[:a]}/"
  rows << [p[:title][0, 100], "https://vitalityritual.org/pins/pin-#{n}.jpg", BOARDS[p[:board]], '', p[:desc][0, 500],
           "https://vitalityritual.org/#{path}?from=pinterest&pin=#{n}", p[:at].strftime('%Y-%m-%dT%H:%M:%S'), '']
  et = p[:at] - 5 * 3600
  sheet << %(<figure><img src="file://#{base}.png"><figcaption>#{n} · #{et.strftime('%a %b %-d, %-l:%M %p')}<br>#{p[:title]}</figcaption></figure>)
end
CSV.open(File.join(__dir__, 'batch4.csv'), 'w') do |csv|
  csv << ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']
  rows.each { |r| csv << r }
end
File.write(File.join(__dir__, 'batch4-sheet.html'), %(<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;width:2400px;background:#efe9e1;font-family:Georgia;display:grid;grid-template-columns:repeat(6,1fr);gap:22px;padding:28px;box-sizing:border-box}img{width:100%;display:block}figure{margin:0}figcaption{font-size:16px;color:#4a382b;margin-top:7px;line-height:1.35}</style></head><body>#{sheet.join}</body></html>))
system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', '--allow-file-access-from-files', '--window-size=2400,2700',
       "--screenshot=#{File.join(__dir__, 'batch4-sheet.png')}", "file://#{File.join(__dir__, 'batch4-sheet.html')}", out: File::NULL, err: File::NULL)
puts "ok #{B3.size}"
