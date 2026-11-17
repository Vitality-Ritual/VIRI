# encoding: utf-8
# VIRI-style "Type A personality traits" card for "Confessions of a Type A Girl".
# Same five points as the Google AI Overview it replaces (source: Psych Central).
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
W, H = 900, 900
TRAITS = [
  ['Driven &amp; Ambitious', 'Highly focused on goals, achievement and status.'],
  ['Time Urgent', 'Constantly rushed, impatient with delays, and dislikes wasting time.'],
  ['Competitive', 'Views most situations as a challenge or contest to win.'],
  ['High Control &amp; Multitasking', 'Prefers structure, micromanaging tasks and juggling multiple projects.'],
  ['Stress Risk', 'More prone to chronic stress, impatience, anger and physical tension.'],
]
items = TRAITS.each_with_index.map do |(name, text), i|
  %(<div class="row"><div class="num">0#{i + 1}</div><div><div class="name">#{name}</div><div class="text">#{text}</div></div></div>)
end.join
html = <<-H
<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=EB+Garamond:ital@0;1&family=Mea+Culpa&display=block">
<style>
*{box-sizing:border-box}html,body{margin:0}
body{width:#{W}px;height:#{H}px;background:#f6f2ec;font-family:'EB Garamond',Georgia,serif;color:#3b322a;padding:30px}
.card{height:100%;border:1px solid #cbbfb0;padding:58px 76px 44px;display:flex;flex-direction:column}
.eyebrow{text-align:center;font-family:'Bodoni Moda',serif;font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:#8a7a6b}
.title{text-align:center;margin:20px 0 6px;line-height:1}
.script{font-family:'Mea Culpa',cursive;font-size:64px;color:#4a382b;display:block;margin-bottom:-6px}
.caps{font-family:'Bodoni Moda',serif;font-size:30px;letter-spacing:.2em;text-transform:uppercase;display:block}
.rule{width:56px;height:1px;background:#4a382b;margin:26px auto 22px}
.row{display:grid;grid-template-columns:62px 1fr;gap:6px;padding:19px 0;border-top:1px solid #e3d9cd}
.row:last-child{border-bottom:1px solid #e3d9cd}
.num{font-family:'Bodoni Moda',serif;font-style:italic;font-size:26px;color:#4a382b;line-height:1.05}
.name{font-family:'Bodoni Moda',serif;font-size:15px;letter-spacing:.2em;text-transform:uppercase;color:#3b322a;margin-bottom:6px}
.text{font-size:21px;line-height:1.35;color:#4f443a}
.foot{margin-top:auto;display:flex;justify-content:space-between;font-family:'Bodoni Moda',serif;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#8a7a6b;padding-top:22px}
</style></head><body><div class="card">
<div class="eyebrow">The VIRI Edit &middot; A definition</div>
<div class="title"><span class="script">the</span><span class="caps">Type A Personality</span></div>
<div class="rule"></div>
<div class="list">#{items}</div>
<div class="foot"><span>Source: Psych Central</span><span>vitalityritual.org</span></div>
</div></body></html>
H
f = File.join(__dir__, 'type-a-card.html')
File.write(f, html)
system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=8000', '--force-device-scale-factor=2',
       "--window-size=#{W},#{H}", "--screenshot=#{File.join(__dir__, 'type-a-traits.png')}", "file://#{f}", out: File::NULL, err: File::NULL)
puts 'ok'
