# encoding: utf-8
# "The original vs the revised" schedule graphic for "Confessions of a Type A Girl".
# Same look as make-card.rb (the Type A definition card). Run: ruby make-schedule.rb
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
W, H = 1200, 1160

ORIGINAL = [
  ['5:00 a.m.', 'Wake up'],
  ['5:15 a.m.', 'Work out, one hour'],
  ['7:00 a.m.', 'VIRI, one hour'],
  ['8:45 a.m. – 5 p.m.', 'Work'],
  ['6:15 p.m.', 'Coursework, one hour'],
  ['7:15 p.m.', 'Read, 30 minutes'],
  ['8:30 p.m.', 'Asleep'],
]
REVISED = [
  ['5 – 6 a.m.', 'Wake up <em>(after a late night, sleep wins)</em>'],
  ['Morning', 'Move: run, ride, lift or walk'],
  ['Before work', 'VIRI, if there’s time'],
  ['8:45 a.m. – 5 p.m.', 'Work'],
  ['Evening', 'One flex block: coursework, VIRI <em>or</em> reading'],
  ['8:30 – 9:30 p.m.', 'Asleep'],
]
WEEK = [
  ['5', 'workouts'],
  ['3', 'VIRI articles <em>(or 5 hours)</em>'],
  ['5', 'hours of coursework'],
  ['4', 'nights of reading'],
]

col = lambda do |label, kicker, rows, bar|
  r = rows.map { |t, x| %(<div class="row"><div class="time">#{t}</div><div class="what">#{x}</div></div>) }.join
  %(<div class="col"><div class="label">#{label}</div><div class="kicker">#{kicker}</div><div class="rows">#{r}</div><div class="bar">#{bar}</div></div>)
end
week = WEEK.map { |n, x| %(<div class="goal"><span class="n">#{n}</span><span class="g">#{x}</span></div>) }.join

html = <<-H
<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=EB+Garamond:ital@0;1&family=Mea+Culpa&display=block">
<style>
*{box-sizing:border-box}html,body{margin:0}
body{width:#{W}px;height:#{H}px;background:#f6f2ec;font-family:'EB Garamond',Georgia,serif;color:#3b322a;padding:30px}
.card{height:100%;border:1px solid #cbbfb0;padding:54px 64px 40px;display:flex;flex-direction:column}
.eyebrow{text-align:center;font-family:'Bodoni Moda',serif;font-size:13px;letter-spacing:.34em;text-transform:uppercase;color:#8a7a6b}
.title{text-align:center;margin:18px 0 0;line-height:1}
.script{font-family:'Mea Culpa',cursive;font-size:66px;color:#4a382b;display:block;margin-bottom:10px}
.caps{font-family:'Bodoni Moda',serif;font-size:32px;letter-spacing:.2em;text-transform:uppercase;display:block}
.rule{width:56px;height:1px;background:#4a382b;margin:26px auto 30px}
.cols{display:grid;grid-template-columns:1fr 1px 1fr;gap:0 44px}
.divider{background:#e3d9cd}
.label{font-family:'Bodoni Moda',serif;font-size:19px;letter-spacing:.24em;text-transform:uppercase;color:#3b322a}
.kicker{font-family:'Bodoni Moda',serif;font-style:italic;font-size:21px;color:#8a7a6b;margin:8px 0 18px}
.row{display:grid;grid-template-columns:178px 1fr;gap:14px;padding:13px 0;border-top:1px solid #e3d9cd;align-items:baseline}
.time{font-family:'Bodoni Moda',serif;font-style:italic;font-size:17px;color:#4a382b}
.what{font-size:22px;line-height:1.3;color:#4f443a}
.what em{color:#8a7a6b}
.col.old .what{color:#8a7a6b}
.bar{border-top:1px solid #4a382b;padding-top:14px;margin-top:4px;font-size:21px;line-height:1.35}
.bar b{font-family:'Bodoni Moda',serif;font-weight:400;font-size:13px;letter-spacing:.24em;text-transform:uppercase;display:block;margin-bottom:6px;color:#8a7a6b}
.week{margin-top:34px;background:#ece5db;padding:22px 30px 24px}
.week .label{text-align:center;font-size:15px;margin-bottom:16px}
.goals{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.goal{text-align:center;line-height:1.25}
.n{display:block;font-family:'Bodoni Moda',serif;font-style:italic;font-size:42px;color:#4a382b;line-height:1;margin-bottom:6px}
.g{font-size:19px;color:#4f443a}.g em{color:#8a7a6b}
.foot{margin-top:auto;display:flex;justify-content:space-between;font-family:'Bodoni Moda',serif;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#8a7a6b;padding-top:22px}
</style></head><body><div class="card">
<div class="eyebrow">The VIRI Edit &middot; Confessions of a Type A Girl</div>
<div class="title"><span class="script">my</span><span class="caps">Winter Arc Schedule</span></div>
<div class="rule"></div>
<div class="cols">
#{col.call('The Original', 'Every item, every day', ORIGINAL, '<b>A good day</b>All of it. Every single day.').sub('class="col"', 'class="col old"')}
<div class="divider"></div>
#{col.call('The Revised', 'A range, not a rulebook', REVISED, '<b>A good day</b>Two of my four priorities. All four is a bonus.')}
</div>
<div class="week"><div class="label">The weekly goals</div><div class="goals">#{week}</div></div>
<div class="foot"><span>Part 1</span><span>vitalityritual.org</span></div>
</div></body></html>
H
f = File.join(__dir__, 'schedule-card.html')
File.write(f, html)
system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=8000', '--force-device-scale-factor=2',
       "--window-size=#{W},#{H}", "--screenshot=#{File.join(__dir__, 'type-a-schedule.png')}", "file://#{f}", out: File::NULL, err: File::NULL)
puts 'ok'
