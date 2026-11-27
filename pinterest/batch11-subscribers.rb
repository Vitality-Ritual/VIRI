# encoding: utf-8
# Pinterest batch 11 (27 Nov 2026): 60 pins (164-223) built for ONE goal: email sign-ups. Almost every pin
# points at a free thing that captures an email (printable, planner, quizzes, word generator, tools, subscribe).
# Photo-led (her top pins were plain photos), short keyword title on the image, keyword-first pin titles,
# descriptions tease and never list. 4 a day (8:00, 12:00, 3:30, 7:30 ET) from Fri Nov 28; December Checklist pins
# go last (that article unlocks Dec 1). Output: out/pin-164..223.png, website/pins/*.jpg, batch11-a..e.csv, batch11-sheet-*.png
#   ruby pinterest/batch11-subscribers.rb
require 'csv'
require 'time'
src = File.read(File.join(__dir__, 'make-pins.rb'), encoding: 'UTF-8')
eval(src[0...src.index('only = ARGV')].sub("require_relative 'pins-data'", "require File.join(__dir__, 'pins-data')").gsub('__dir__', "'#{__dir__}'"), binding, File.join(__dir__, 'make-pins.rb'))
WEB = File.join(ROOT, 'website')
IG = File.join(ROOT, 'instagram', 'ig-photos')
EXCLUDED = [64, 66, 68, 71, 25]
ph = ->(n) { raise "photo #{n} is excluded" if EXCLUDED.include?(n); "file://#{IG}/viri-ig-#{format('%02d', n)}.jpg" }

def t_photo_title(p)
  top = p[:top]
  shade = top ? 'to bottom' : 'to top'
  <<-H
<div class="pin" style="position:relative;background:url('#{p[:photo]}') #{p[:pos] || 'center'}/cover;justify-content:#{top ? 'flex-start' : 'flex-end'};color:#fbf7f1">
 <div style="position:absolute;inset:0;background:linear-gradient(#{shade},rgba(32,24,18,.78) 0%,rgba(32,24,18,.46) 36%,rgba(32,24,18,0) 62%)"></div>
 <div style="position:relative;padding:#{top ? '78px 70px 0' : '0 70px 74px'};text-align:center">
  <div class="cap" style="color:rgba(251,247,241,.9);margin-bottom:20px">#{p[:tl]}</div>
  <div style="font-size:#{fit(p[:caps], 860, 84)}px;line-height:1.05;letter-spacing:3px">#{p[:caps]}</div>
  <div class="script" style="font-size:#{p[:scriptsize] || 108}px;line-height:1.05">#{p[:script]}</div>
  <div class="cap" style="color:rgba(251,247,241,.82);margin-top:18px;font-size:15px">vitalityritual.org</div>
 </div>
</div>
  H
end

D = {
  print: { path: 'printable/', board: :arc, kw: 'winter arc printable, habit tracker printable, free printable, 30 day habit tracker, winter arc, self care planner, cozy winter, habit tracker' },
  plan:  { path: 'read/winter-arc-planner/', board: :arc, kw: 'winter arc planner, winter arc checklist, winter goals, free planner, goal setting, one page planner, 2027 goals, winter plan' },
  quiz:  { path: 'quiz/', board: :arc, kw: 'winter arc quiz, winter arc, personality quiz, winter goals, glow up plan, self improvement, winter aesthetic' },
  wq:    { path: 'workout-quiz/', board: :wellness, kw: 'workout personality quiz, fitness quiz, what workout is right for me, workout motivation, pilates, running, strength training, fitness inspiration' },
  guide: { path: 'read/ultimate-guide-2027/', board: :arc, kw: '2027 goals, new year goals, 2027 planning, word of the year, 2027 vision board, new year reset, goal setting, free printable planner' },
  pick:  { path: 'read/pick-a-card/', board: :wellness, kw: 'end of year reflection, journal prompts, year in review, reflection questions, new year reflection, self reflection, december reset' },
  chk:   { path: 'read/december-checklist/', board: :wellness, kw: 'december checklist, december bucket list, cozy december, winter bucket list, holiday self care, december reset, december activities' },
  tools: { path: 'tools/', board: :postgrad, kw: 'free planner, free printable, habit tracker, goal setting, winter arc, 20s planning, self improvement tools' },
  sub:   { path: 'subscribe/', board: :postgrad, kw: 'sunday newsletter, newsletter for women in their 20s, lifestyle newsletter, wellness newsletter, post grad life, 20s advice, winter arc' },
}
T = :photo_title; B = :photo_band
# [dest, photo, template, caps, script, tl, title, desc, extra]
ROWS = [
  [:print, 6, T, 'FREE PRINTABLE', 'winter arc tracker', 'Winter arc', 'Free Winter Arc Printable: 30-Day Habit Tracker for Cozy Season', 'Three pages, thirty days and one calm plan for the season ahead. Print it or fill it in on your tablet. Free when you join the VIRI Edit.'],
  [:print, 12, B, 'THE WINTER ARC', 'printable', 'Free download', 'Winter Arc Habit Tracker Printable (Free 3-Page Download)', 'A free winter arc habit tracker you can print or fill in digitally, with a plan for the months ahead. Download it free when you join the VIRI Edit.', { pal: :sand, line: 'three pages · print or fill in' }],
  [:print, 46, T, '30 DAYS', 'of small habits', 'Free printable', '30 Day Habit Tracker Printable: Small Habits for Winter', 'Thirty days of small habits that feel doable even in the darkest month. A free printable from the VIRI Edit, yours when you join.'],
  [:print, 38, T, 'YOUR SUNDAY RESET', 'printable', 'Free printable', 'Sunday Reset Printable: A Free Habit Tracker for the Week Ahead', 'Your Sunday reset, but printable. A free habit tracker and winter plan from the VIRI Edit, yours when you join.', { top: true }],
  [:print, 51, B, 'FREE PRINTABLE', 'winter plan', 'Winter arc', 'Winter Arc Planner Printable: Habit Tracker and Seasonal Plan', 'A free printable to plan your winter without the pressure to reinvent yourself. Print it, fill it in and keep it where you will see it.', { pal: :oat, line: 'habit tracker + winter plan' }],
  [:print, 52, T, 'PRINT IT', 'fill it in', 'Free download', 'Free Printable Habit Tracker: Print It or Fill It In on Your iPad', 'A simple winter habit tracker and plan, free with your email. Works on paper or on a tablet.'],
  [:print, 55, T, 'MAKE WINTER', 'your best season', 'Free printable', 'Cozy Winter Habits Printable: Make This Your Best Season', 'Cozy does not have to mean unproductive. A free winter habit printable from the VIRI Edit.'],
  [:print, 36, B, 'DOWNLOAD', 'the printable', 'Free download', 'Winter Arc Printable Download: Free With Your Email', 'Join the VIRI Edit and the winter arc printable downloads right away. Three pages, free.', { pal: :cream, line: 'instant · free with your email' }],
  [:print, 50, T, 'A CALMER WINTER', 'starts here', 'Free printable', 'Self Care Winter Planner Printable (Free Habit Tracker)', 'A gentle winter planner for the girl who wants structure without the hustle. Free from the VIRI Edit.'],
  [:print, 8, T, '30-DAY', 'winter reset', 'Free printable', '30 Day Winter Reset Printable: Free Habit Tracker', 'Reset your routines one small habit at a time. A free thirty-day printable from the VIRI Edit.'],
  [:plan, 29, T, 'BUILD YOUR', 'winter arc', 'Free planner', 'Free Winter Arc Planner: Build Your Plan in 5 Questions', 'Five quick questions, about a minute, and a free one-page winter plan with weekly habits and a goal for each month. No 5 a.m. ice baths required.', { top: true }],
  [:plan, 27, B, 'WINTER ARC', 'plan in a minute', 'Free planner', 'Winter Arc Plan Generator: A Free One-Page Plan in 60 Seconds', 'Answer a few questions and get a one-page winter arc plan built around your life. Free, and it takes about a minute.', { pal: :cream, line: 'five questions · one page' }],
  [:plan, 53, T, 'START YOUR', '2027 goals now', 'Free planner', 'Start Your 2027 Goals Now: A Free One-Page Winter Planner', 'Get a head start on 2027 with a free one-page plan for the winter. Weekly habits, monthly goals, five quick questions.'],
  [:plan, 58, T, 'WINTER ARC', 'that fits your life', 'Free planner', 'Winter Arc Checklist: Plan Your Whole Winter in 5 Questions', 'A winter arc that fits your real schedule. Take five questions and get a free plan you can actually keep.'],
  [:plan, 3, T, 'A SOFTER', 'winter arc', 'Free planner', 'Soft Winter Arc Plan: A Free Planner for a Gentler Season', 'Not every winter arc is about waking up at 5 a.m. Build a softer one in a minute with this free planner.'],
  [:plan, 22, B, 'FREE PLANNER', 'your winter, planned', 'Free tool', 'Winter Goals Planner: One Goal a Month, Free One-Page Plan', 'A calmer way to plan the winter: a few small goals, a weekly rhythm and one page to keep it all. Free.', { pal: :oat, line: 'takes about a minute' }],
  [:plan, 7, T, 'PLAN THE SEASON', 'before it plans you', 'Free planner', 'Winter Planning Template: Free Printable One-Page Plan', 'A free winter planning template that turns five answers into a one-page plan.'],
  [:plan, 14, T, 'YOUR WINTER ARC', 'in one page', 'Free planner', 'Winter Arc Planner for Busy Girls (Free, Takes a Minute)', 'Busy week, big goals? Get a free one-page winter arc plan that works around your 9-to-5.', { top: true }],
  [:quiz, 21, T, 'WHICH WINTER ARC', 'are you?', 'Free quiz', 'Which Winter Arc Are You? Take the Free 1-Minute Quiz', 'Six quick questions to find out what this winter is really about for you, plus three habits to start with. Free.'],
  [:quiz, 16, T, 'WHAT IS YOUR', 'winter about?', 'Free quiz', 'Winter Arc Quiz: What Is Your Winter About?', 'Find your winter arc in one minute and get three anchor habits for the season. Free quiz from the VIRI Edit.'],
  [:quiz, 44, B, 'FIND YOUR', 'winter arc', 'Free quiz', 'Winter Arc Personality Quiz: Find Your Season Plan', 'Six questions, about a minute, and a plan for the season that actually suits you.', { pal: :sand, line: 'six questions · one minute' }],
  [:quiz, 13, T, 'WINTER ARC', 'personality quiz', 'Free quiz', 'Winter Arc Quiz for Girls Who Want a Calmer Season', 'A free personality quiz for your winter arc, with three habits to start this week.'],
  [:quiz, 20, T, 'WHICH ARE YOU?', 'take the quiz', 'Free quiz', 'What Winter Arc Is Right for You? A Free Quiz', 'Take the one-minute quiz and find out which kind of winter arc fits you. Free.'],
  [:quiz, 1, B, 'THE WINTER ARC', 'quiz', 'Free quiz', 'Winter Arc Quiz: Get Three Habits to Start This Week', 'Answer six questions and leave with three small habits for the season. Free, about a minute.', { pal: :oat, line: 'six questions · three habits to start' }],
  [:wq, 59, T, 'WHICH WORKOUT', 'fits you?', 'Free quiz', 'Which Workout Fits Your Personality? Take the Free Quiz', 'Six quick questions to find the kind of workout you will actually stick with, plus three ways to start this week.'],
  [:wq, 34, B, 'FIND YOUR', 'workout match', 'Free quiz', 'Workout Personality Quiz: Find What You’ll Actually Stick With', 'Not every workout fits every personality. Take the free one-minute quiz and find yours.', { pal: :sand, line: 'six questions · one minute' }],
  [:wq, 63, T, 'WORKOUT', 'personality quiz', 'Free quiz', 'What Workout Should I Do? A Free One-Minute Quiz', 'Stuck in a workout rut? Answer a few questions and find the kind of movement that suits you.'],
  [:wq, 48, T, 'THE WORKOUT', 'you’ll stick with', 'Free quiz', 'Best Workout for Your Personality: Free Fitness Quiz', 'Find the workout that fits how you actually like to move, then get three ways to start this week.'],
  [:wq, 23, T, 'WHAT KIND OF', 'exerciser are you?', 'Free quiz', 'What Kind of Exerciser Are You? Free Fitness Personality Quiz', 'A one-minute quiz for the girl who wants a workout routine that finally sticks.'],
  [:guide, 18, T, 'FIND YOUR', '2027 word', 'Free generator', '2027 Word of the Year Generator (Free, Takes 2 Minutes)', 'Not sure what your word of the year should be? Answer a few questions and get a suggestion. Free, and part of the 2027 guide.'],
  [:guide, 30, B, 'ONE-PAGE', '2027 plan', 'Free printable', 'Free 2027 Planner Printable: One Page, Zero Overwhelm', 'A blank one-page plan for the year ahead, free with the 2027 guide. Print it and fill it in.', { pal: :oat, line: 'print it, fill it in' }],
  [:guide, 53, T, '2027', 'vision board', 'Pinterest first', '2027 Vision Board Ideas: How to Make One That Actually Works', 'Start on Pinterest, finish on a real board you will see every morning. One step of the free 2027 guide.'],
  [:guide, 29, T, '2027 GOALS', 'that survive a bad week', 'Free guide', '2027 Goal Setting That Survives Your Worst Week (Free Guide)', 'Goals built for your worst week, not your best one. One step of the free nine-step 2027 guide.', { top: true, scriptsize: 96 }],
  [:guide, 46, T, 'START NOW', 'not january 1st', 'Free guide', 'New Year Reset 2027: Why to Start in December', 'The best time to start is while the idea still feels exciting. A free guide to planning your 2027.'],
  [:guide, 51, T, 'THE 2027', 'planning guide', 'Nine steps', '2027 Planning Guide: A Free 9-Step Plan for Your Best Year', 'Nine steps to start 2027 off right, with a free word generator and a printable plan along the way.'],
  [:guide, 69, B, 'CHOOSE YOUR', 'word for 2027', 'Free tool', 'How to Choose Your Word of the Year for 2027', 'Skip the guesswork. A few questions, one suggestion, and a word to carry through the year. Free.', { pal: :sand, line: 'answer a few questions' }],
  [:guide, 12, T, 'A RESET,', 'not a personality', '2027 goals', 'New Year Goals Without the Pressure: A Realistic 2027 Plan', 'New year goals for people who do not want to reinvent themselves. A free guide for 2027.'],
  [:guide, 5, T, 'MAKE 2027', 'your year', 'Free guide', 'How to Make 2027 Your Best Year Yet (Free 9-Step Guide)', 'A free nine-step guide to starting 2027 off right, from the VIRI Edit.'],
  [:guide, 40, B, '2027 WORD', 'of the year', 'Free generator', 'Word of the Year Ideas 2027: Find Yours With a Free Generator', 'Stuck on a word of the year? Get a suggestion from a free generator, then keep going until one feels right.', { pal: :cream, line: 'free · two minutes' }],
  [:guide, 42, T, 'PLAN 2027', 'this week', 'Free guide', '2027 Planning Checklist: What to Do Before January', 'Start your 2027 planning this week, not on January 1st. A free guide with a printable plan.'],
  [:pick, 11, T, '24 QUESTIONS', 'before the new year', 'Free reflection', 'End of Year Reflection Questions: Pick a Card (Free Interactive)', 'Twenty-four reflection questions hiding behind a deck of cards. Light, honest and deeper. Free.'],
  [:pick, 32, T, 'YEAR-END', 'reflection', 'Free tool', '24 Year End Reflection Questions to Answer Before January', 'Close out the year with questions worth sitting with. Pick a card, answer it your way, and keep the ones you want to write about.'],
  [:pick, 39, B, 'REFLECT ON', 'your year', 'Free tool', 'Journal Prompts for the End of the Year: A Free Interactive Deck', 'Flip a card, answer honestly and keep the ones that stay with you. Free from the VIRI Edit.', { pal: :oat, line: 'light · medium · deeper' }],
  [:pick, 70, T, 'QUESTIONS', 'worth asking', 'Free reflection', 'New Year Reflection Prompts: Questions to Ask Yourself in December', 'A calmer way to look back on your year before starting the next. Free reflection cards.'],
  [:pick, 11, B, 'PICK A CARD', 'reflect', 'Free tool', 'Year in Review Questions: A Free December Reflection', 'Look back on the year one card at a time. Answer out loud, in your notes app, or not at all.', { pal: :sand, line: 'a free december reflection' }],
  [:tools, 8, T, 'FREE TOOLS', 'for your best winter', 'Free tools', 'Free Planning Tools: Quizzes, Printables and Planners', 'Free quizzes, a planner and printables for your best winter yet, all from the VIRI Edit.'],
  [:tools, 38, B, 'THE FREE TOOLS', 'page', 'Free tools', 'Free Winter Arc Tools: Planner, Quiz and Printable', 'Everything free in one place: plan your winter, take a quiz, print a tracker.', { pal: :oat, line: 'quizzes · planners · printables' }],
  [:tools, 52, T, 'FREE', 'winter arc tools', 'Free tools', 'Free Habit and Goal Planning Tools for Your 20s', 'Planning tools for women in their 20s who want structure without the hustle. Free.'],
  [:tools, 50, T, 'PLAN YOUR', 'winter for free', 'Free tools', 'Free Planner, Quiz and Printable for a Calm Winter', 'A calm, simple set of free tools for the season ahead.'],
  [:tools, 55, T, 'WINTER ARC', 'toolkit', 'Free tools', 'Winter Arc Toolkit: Free Tools for a Better Season', 'A free winter arc toolkit from the VIRI Edit.'],
  [:sub, 5, T, 'A NEW EDIT', 'every sunday', 'The VIRI Edit', 'Sunday Newsletter for Women in Their 20s: The VIRI Edit', 'Life outside the inbox. A new edit every Sunday on winter arc plans, habits, fitness, career and money. Free to join, with a printable as a welcome.'],
  [:sub, 70, B, 'THE VIRI EDIT', 'sunday newsletter', 'Free', 'Wellness and Lifestyle Newsletter for Your 20s (Free)', 'A free Sunday newsletter on wellness, habits, career and money for women in their 20s.', { pal: :cream, line: 'life outside the inbox' }],
  [:sub, 20, T, 'JOIN THE', 'sunday edit', 'Free newsletter', 'Join the Sunday Edit: Winter Arc Plans, Habits and Career Tips', 'One new edit every Sunday, free. Plans, habits and honest career and money advice for your 20s.'],
  [:sub, 1, T, 'LIFE OUTSIDE', 'the inbox', 'The VIRI Edit', 'Life Outside the Inbox: A Free Sunday Newsletter', 'For the hours around your 9-to-5. A free newsletter every Sunday from the VIRI Edit.'],
  [:sub, 3, T, 'YOUR SUNDAY', 'reading', 'The VIRI Edit', 'A Weekly Newsletter for Post-Grad Girls (Free, Every Sunday)', 'A weekly newsletter for post-grad girls figuring it out: habits, work, money and more. Free.'],
  [:chk, 7, T, 'DECEMBER', 'checklist', 'Free checklist', 'December Bucket List: A Free Checklist for a Cozy, Gentler Month', 'Small, mostly free things to make December feel softer, with a checklist you can tick off online.'],
  [:chk, 16, T, 'COZY DECEMBER', 'week by week', 'Free checklist', 'Cozy December Checklist: A Slower, Softer Month (Free)', 'A simple four-week December checklist for a cozier month. Free to tick off online.'],
  [:chk, 3, B, 'DECEMBER', 'reset', 'Free checklist', 'Free and Cheap December Activities: A Simple Weekly Checklist', 'No big plans needed. Small, low-cost things to make December feel good.', { pal: :sand, line: 'small · cheap · cozy' }],
  [:chk, 6, T, 'A GENTLER', 'december', 'Free checklist', 'December Self Care Checklist: Tick Off Small Wins All Month', 'A gentle December checklist that rewards small wins. Free.'],
  [:chk, 12, T, 'DECEMBER', 'without the burnout', 'Free checklist', 'Holiday Burnout Prevention: A Gentle December Checklist', 'End the year calm, not burnt out. A free checklist for the month ahead.'],
]
raise "row count #{ROWS.size}" unless ROWS.size == 60

# interleave destinations round-robin (chk stays last: that article unlocks Dec 1)
groups = ROWS.group_by(&:first)
order = %i[print plan quiz wq guide pick tools sub]
seq = []
i = 0
while seq.size < 55
  order.each { |k| (r = groups[k][i]) && seq << r }
  i += 1
end
seq += groups[:chk]
raise 'lost rows' unless seq.size == 60

SLOTS = [[8, 0], [12, 0], [15, 30], [19, 30]]
rows = []; sheet = []
seq.each_with_index do |(dest, photo, tpl, caps, script, tl, title, desc, ex), idx|
  ex ||= {}
  n = 164 + idx
  day = idx / 4; slot = SLOTS[idx % 4]
  at = Time.utc(2026, 11, 28) + day * 86400 + (slot[0] + 5) * 3600 + slot[1] * 60
  p = { photo: ph[photo], caps: caps, script: script, tl: tl, line: ex[:line], pal: ex[:pal], top: ex[:top], scriptsize: ex[:scriptsize] }
  base = File.join(OUT, "pin-#{n}")
  File.write("#{base}.html", head + send("t_#{tpl}", p) + "</body></html>\n")
  system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=7000', '--allow-file-access-from-files',
         '--window-size=1000,1500', "--screenshot=#{base}.png", "file://#{base}.html", out: File::NULL, err: File::NULL)
  system('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '86', "#{base}.png", '--out', File.join(WEB, 'pins', "pin-#{n}.jpg"), out: File::NULL)
  d = D[dest]
  rows << [title[0, 100], "https://vitalityritual.org/pins/pin-#{n}.jpg", BOARDS[d[:board]], '', desc[0, 500],
           "https://vitalityritual.org/#{d[:path]}?from=pinterest&pin=#{n}", at.strftime('%Y-%m-%dT%H:%M:%S'), d[:kw]]
  sheet << %(<figure><img src="file://#{base}.png" width=300><figcaption>#{n} · #{dest} · #{(at - 5 * 3600).strftime('%a %b %-d %-l:%M%p')}</figcaption></figure>)
  $stdout.puts n if (idx % 10).zero?
end
HDR = ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']
%w[a b c d e].each_with_index do |l, k|
  CSV.open(File.join(__dir__, "batch11-#{l}.csv"), 'w') { |csv| csv << HDR; rows[k * 12, 12].each { |r| csv << r } }
end
sheet.each_slice(20).each_with_index do |s, k|
  f = File.join(__dir__, "batch11-sheet-#{k + 1}")
  File.write("#{f}.html", %(<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;width:1560px;background:#efe9e1;font-family:Georgia;display:grid;grid-template-columns:repeat(5,300px);gap:10px;padding:10px}figure{margin:0}figcaption{font-size:14px;padding:4px 0}</style></head><body>#{s.join}</body></html>))
  system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=5000', '--allow-file-access-from-files', '--window-size=1580,1720', "--screenshot=#{f}.png", "file://#{f}.html", out: File::NULL, err: File::NULL)
end
puts "ok #{rows.size}"
