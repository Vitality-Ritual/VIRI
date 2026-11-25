# encoding: utf-8
# Pinterest pins for 'The Ultimate Guide to Making 2027 Your Best Year Yet' (25 Nov 2026): pins 158-163, Nov 26 - Dec 10 (guide is live 25 Nov).
# Photo-led pins built on VIRI Instagram photos (her choice, 18 Nov: stop and switch photos if Pinterest flags
# the account even once). Every row has Keywords filled in.
#   ruby pinterest/batch9-guide.rb
# Output: out/pin-155..157.png, website/pins/*.jpg, batch9-guide.csv, batch9-guide-sheet.png
require 'csv'
require 'time'
src = File.read(File.join(__dir__, 'make-pins.rb'), encoding: 'UTF-8')
eval(src[0...src.index('only = ARGV')].sub("require_relative 'pins-data'", "require File.join(__dir__, 'pins-data')").gsub('__dir__', "'#{__dir__}'"), binding, File.join(__dir__, 'make-pins.rb'))
WEB = File.join(ROOT, 'website')
IG = File.join(ROOT, 'instagram', 'ig-photos')
EXCLUDED = [64, 66, 68, 71]   # she asked (18 Nov) never to use these IG photos again
ph = ->(n) { raise "photo #{n} is excluded" if EXCLUDED.include?(n); "file://#{IG}/viri-ig-#{format('%02d', n)}.jpg" }

# Full-bleed photo, soft shade at the bottom (or top), white serif title. Closest to the photo pins that get views.
def t_photo_title(p)
  top = p[:top]
  shade = top ? 'to bottom' : 'to top'
  <<-H
<div class="pin" style="position:relative;background:url('#{p[:photo]}') #{p[:pos] || 'center'}/cover;justify-content:#{top ? 'flex-start' : 'flex-end'};color:#fbf7f1">
 <div style="position:absolute;inset:0;background:linear-gradient(#{shade},rgba(32,24,18,.74) 0%,rgba(32,24,18,.42) 34%,rgba(32,24,18,0) 58%)"></div>
 <div style="position:relative;padding:#{top ? '78px 70px 0' : '0 70px 74px'};text-align:center">
  <div class="cap" style="color:rgba(251,247,241,.86);margin-bottom:20px">#{p[:tl]}</div>
  <div style="font-size:#{fit(p[:caps], 860, 84)}px;line-height:1.05;letter-spacing:3px">#{p[:caps]}</div>
  <div class="script" style="font-size:#{p[:scriptsize] || 108}px;line-height:1.05">#{p[:script]}</div>
  <div class="cap" style="color:rgba(251,247,241,.8);margin-top:18px;font-size:15px">vitalityritual.org</div>
 </div>
</div>
  H
end

WQ = 'workout-quiz/'
QZ = 'quiz/'
PR = 'printable/'
K_WQ = 'workout personality quiz, fitness quiz, what workout is right for me, workout motivation, fitness inspiration, pilates, running, strength training'
K_GIFT = 'gifts for fitness lovers, gift guide for her, fitness gift ideas, runner gifts, christmas gift ideas, holiday gift guide 2026'
K_ARC = 'winter arc, winter arc quiz, winter arc checklist, winter arc aesthetic, winter goals, glow up plan'
K_RUN = 'first marathon, marathon training plan for beginners, running tips for beginners, running motivation, half marathon training'
K_NY = 'new year goals, 2027 goals, new year reset, goal setting, productivity tips, type a personality'

K_GUIDE = '2027 goals, new year goals, 2027 planning, word of the year, vision board, new year reset, goal setting, habit tracker, 2027 planner, free printable planner'
B = [
  { a: 'ultimate-guide-2027', t: :photo_title, photo: ph[51], tl: 'The free guide', caps: '2027 PLANNING GUIDE', script: 'nine steps', board: :arc, kw: K_GUIDE,
    title: 'The Ultimate Guide to Making 2027 Your Best Year Yet (Free 9-Step Plan)', desc: 'Nine steps to start your 2027 off right, with a free word generator and a printable one-page plan along the way. Do them in order or skip around, and start this week instead of waiting for January.' },
  { a: 'ultimate-guide-2027', t: :photo_band, pal: :sand, photo: ph[18], tl: 'Need some help?', caps: 'FIND YOUR 2027 WORD', script: 'a free generator', line: 'a few questions, one word for the year', board: :postgrad, kw: K_GUIDE,
    title: '2027 Word of the Year Generator: Find Your Word in a Few Questions', desc: 'Not sure what your word of the year should be? Answer a few questions and get a suggestion, then keep going until one feels right. Free, and part of the 2027 guide.' },
  { a: 'ultimate-guide-2027', t: :photo_title, photo: ph[46], tl: 'Fresh start', caps: 'START THIS WEEK', script: 'not on january 1st', board: :wellness, kw: K_GUIDE,
    title: 'How to Start Your 2027 Reset Now, Not on January 1st', desc: 'The best time to start is while the idea still feels exciting. A free guide to planning your 2027, with four small things to do in the next seven days.' },
  { a: 'ultimate-guide-2027', t: :photo_title, photo: ph[29], tl: '2027 goals', caps: 'GOALS THAT STICK', script: 'even on a bad week', top: true, board: :arc, kw: K_GUIDE,
    title: 'How to Set 2027 Goals That Survive a Bad Week', desc: 'Most goals do not fail because you stop caring. They fail because of a bad week. A step in the free 2027 guide on setting goals built for your worst week, not your best one.' },
  { a: 'ultimate-guide-2027', t: :photo_band, pal: :oat, photo: ph[30], tl: 'Free printable', caps: 'ONE-PAGE 2027 PLAN', script: 'print it, fill it', line: 'your word, goals and first habit on one page', board: :arc, kw: K_GUIDE,
    title: 'Free Printable 2027 Planner: One Page for Your Word, Goals and Habits', desc: 'A blank one-page plan for the year ahead, free with the 2027 guide. Print it and fill it in, then keep it where you will see it every day.' },
  { a: 'ultimate-guide-2027', t: :photo_title, photo: ph[53], tl: 'Pinterest first', caps: '2027 VISION BOARD', script: 'then a real one', board: :postgrad, kw: K_GUIDE,
    title: 'How to Make a 2027 Vision Board (Start on Pinterest, Finish on a Poster Board)', desc: 'Start a Pinterest board, then turn it into a real vision board you will see every morning. One step of the free 2027 guide, with my own board as the example.' },
]

TIMES = [[8, 0], [12, 0], [19, 30]]
start = Time.utc(2026, 12, 1)
rows = []
sheet = []
B.each_with_index do |p, i|
  n = 158 + i
  mo, d, h, m = [[11, 26, 12, 0], [11, 28, 8, 0], [11, 30, 19, 30], [12, 4, 12, 0], [12, 7, 8, 0], [12, 10, 19, 30]][i]
  p[:at] = Time.utc(2026, mo, d) + (h + 5) * 3600 + m * 60   # EST -> UTC
  base = File.join(OUT, "pin-#{n}")
  File.write("#{base}.html", head + send("t_#{p[:t]}", p) + "</body></html>\n")
  system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=7000',
         '--allow-file-access-from-files', '--window-size=1000,1500', "--screenshot=#{base}.png", "file://#{base}.html", out: File::NULL, err: File::NULL)
  system('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '86', "#{base}.png", '--out', File.join(WEB, 'pins', "pin-#{n}.jpg"), out: File::NULL)
  path = p[:a].end_with?('/') ? p[:a] : "read/#{p[:a]}/"
  rows << [p[:title][0, 100], "https://vitalityritual.org/pins/pin-#{n}.jpg", BOARDS[p[:board]], '', p[:desc][0, 500],
           "https://vitalityritual.org/#{path}?from=pinterest&pin=#{n}", p[:at].strftime('%Y-%m-%dT%H:%M:%S'), p[:kw]]
  et = p[:at] - 5 * 3600
  sheet << %(<figure><img src="file://#{base}.png"><figcaption>#{n} · #{et.strftime('%a %b %-d, %-l:%M %p')}<br>#{p[:title]}</figcaption></figure>)
end
CSV.open(File.join(__dir__, 'batch9-guide.csv'), 'w') do |csv|
  csv << ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']
  rows.each { |r| csv << r }
end
File.write(File.join(__dir__, 'batch9-guide-sheet.html'), %(<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;width:2400px;background:#efe9e1;font-family:Georgia;display:grid;grid-template-columns:repeat(7,1fr);gap:20px;padding:26px;box-sizing:border-box}img{width:100%;display:block}figure{margin:0}figcaption{font-size:14px;color:#4a382b;margin-top:6px;line-height:1.3}</style></head><body>#{sheet.join}</body></html>))
system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=5000', '--allow-file-access-from-files', '--window-size=2400,3200',
       "--screenshot=#{File.join(__dir__, 'batch9-guide-sheet.png')}", "file://#{File.join(__dir__, 'batch9-guide-sheet.html')}", out: File::NULL, err: File::NULL)
puts "ok #{B.size}"
