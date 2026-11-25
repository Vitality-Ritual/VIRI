# Builds the 2027 guidebook visuals (intro, Step 1, Step 2) with headless Chrome.
#   python3 guide-2027/make-visuals.py   (run from the project folder)
# Output (PNG, next to this script): cover-substack, cover-portrait, cover-lead, toc, step1-pick-a-card, step2-life-areas
import subprocess, os, math
D = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@400;500&family=Mea+Culpa&display=swap">'
CREAM = '#f4efe8'; INK = '#3b322a'; BG = '#e9e4dc'; PAPER = '#fbf9f5'; MUTED = '#665a4e'; TAUPE = '#7d6d60'; LINE = '#d6cec2'

def shoot(name, html, w, h):
    f = os.path.join(D, name + '-source.html')
    open(f, 'w', encoding='utf-8').write(html)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-prefers-color-scheme=light',
                    '--virtual-time-budget=8000', f'--window-size={w},{h}',
                    f'--screenshot={os.path.join(D, name + ".png")}', 'file://' + f],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(f)
    print(name, 'ok')

# ---------- covers (striped ground + off-white card, same family as the other VIRI covers) ----------
WIDE = '''<meta charset="utf-8">%FONTS%
<style>*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:repeating-linear-gradient(90deg,#e8e3db 0 30px,#d3cabd 30px 60px);display:grid;place-items:center}
.card{position:relative;width:660px;height:400px;background:#fcfaf7;box-shadow:0 26px 60px -18px rgba(59,50,42,.38),0 4px 14px rgba(59,50,42,.08);font-family:'Bodoni Moda',serif;color:#6e6055}
.t{position:absolute;top:30px;font-size:11.5px;letter-spacing:.24em;text-transform:uppercase}.l{left:44px}.r{right:44px}
.k{position:absolute;left:0;right:0;text-align:center;text-transform:uppercase;color:#3b322a}
.k1{top:80px;font-size:15px;letter-spacing:.26em;padding-left:.26em}
.num{position:absolute;left:0;right:0;top:92px;text-align:center;font:400 168px/1 'Mea Culpa',cursive;color:#5a4433}
.k2{top:268px;font-size:23px;letter-spacing:.07em}.k2 i{font-style:italic}
.b{position:absolute;bottom:38px;font-size:11.5px;letter-spacing:.24em;text-transform:uppercase}
.seal{position:absolute;bottom:24px;left:50%;margin-left:-23px;width:46px;height:46px;border:1px solid #bfb1a3;border-radius:50%;display:grid;place-items:center;font-size:15px;letter-spacing:.08em;color:#6e6055;padding-left:.08em}</style>
<div class="card"><span class="t l">The VIRI Edit</span><span class="t r">Nine steps</span>
<div class="k k1">The Ultimate Guide to Making</div><div class="num">2027</div><div class="k k2">Your <i>Best</i> Year Yet</div>
<span class="b" style="left:44px">Plan the year</span><span class="seal">VR</span><span class="b" style="right:44px">vitalityritual.org</span></div>'''.replace('%FONTS%', FONTS)
shoot('cover-substack', WIDE, 1200, 630)

PORTRAIT = '''<meta charset="utf-8">%FONTS%
<style>*{margin:0;box-sizing:border-box}body{width:800px;height:1224px;background:repeating-linear-gradient(90deg,#e8e3db 0 40px,#d3cabd 40px 80px);display:grid;place-items:center}
.card{position:relative;width:600px;height:880px;background:#fcfaf7;box-shadow:0 30px 70px -20px rgba(59,50,42,.4),0 4px 16px rgba(59,50,42,.08);font-family:'Bodoni Moda',serif;color:#6e6055}
.t{position:absolute;top:40px;font-size:13px;letter-spacing:.24em;text-transform:uppercase}.l{left:44px}.r{right:44px}
.k{position:absolute;left:0;right:0;text-align:center;text-transform:uppercase;color:#3b322a}
.k1{top:262px;font-size:19px;letter-spacing:.26em;padding-left:.26em}
.num{position:absolute;left:0;right:0;top:318px;text-align:center;font:400 212px/1 'Mea Culpa',cursive;color:#5a4433}
.k2{top:590px;font-size:34px;letter-spacing:.07em}.k2 i{font-style:italic}
.b{position:absolute;bottom:50px;font-size:12px;letter-spacing:.2em;text-transform:uppercase}
.seal{position:absolute;bottom:34px;left:50%;margin-left:-26px;width:52px;height:52px;border:1px solid #bfb1a3;border-radius:50%;display:grid;place-items:center;font-size:17px;letter-spacing:.08em;color:#6e6055;padding-left:.08em}</style>
<div class="card"><span class="t l">The VIRI Edit</span><span class="t r">Nine steps</span>
<div class="k k1">The Ultimate Guide to Making</div><div class="num">2027</div><div class="k k2">Your <i>Best</i> Year Yet</div>
<span class="b" style="left:44px">Plan the year</span><span class="seal">VR</span><span class="b" style="right:44px">vitalityritual.org</span></div>'''.replace('%FONTS%', FONTS)
shoot('cover-portrait', PORTRAIT, 800, 1224)

LEAD = WIDE.replace('width:1200px;height:630px', 'width:1280px;height:960px').replace('.card{position:relative;', '.card{zoom:1.3;position:relative;')
shoot('cover-lead', LEAD, 1280, 960)

# ---------- table of contents (also usable as the clickable list on the website: see toc.html) ----------
PARTS = [
 ('Look back before you leap forward', 'Reflect on what 2026 actually was'),
 ('Choose your themes and your word', 'Three themes, one word'),
 ('Goal setting that survives a bad week', 'One or two goals per theme'),
 ('Build your 2027 vision board', 'Pinterest first, then a real board'),
 ('Habits and systems', 'Triggers, trackers and a weekly reset'),
 ('Your 2027 calendar', 'Milestones, start dates and rest'),
 ('The &ldquo;not doing&rdquo; list', 'Three to five things to let go of'),
 ('My 2027, as an example', 'The whole process, with a real plan'),
 ('Start this week', 'Four small things before the week is out'),
]
TOC_CSS = '''*{box-sizing:border-box;margin:0}
body{width:1200px;background:%BG%;padding:56px;font-family:'Jost',sans-serif;color:%INK%}
.card{background:%PAPER%;border:1px solid %LINE%;padding:44px 64px 28px}
.script{font:400 52px/1 'Mea Culpa',cursive;color:%TAUPE%}
h1{font:400 46px/1.04 'Bodoni Moda',serif;letter-spacing:-.01em;margin:4px 0 26px}h1 em{font-style:italic}
a.row{display:grid;grid-template-columns:84px 1fr;align-items:center;padding:14px 0;border-top:1px solid %LINE%;color:inherit;text-decoration:none}
.n{font:italic 400 48px/1 'Bodoni Moda',serif;color:%TAUPE%}
.t{font:400 29px/1.15 'Bodoni Moda',serif}.s{font-size:17px;color:%MUTED%;margin-top:4px;letter-spacing:.01em}
a.row:hover .t{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:6px}
.foot{border-top:1px solid %LINE%;margin-top:0;padding-top:22px;display:flex;justify-content:space-between;font-size:13px;letter-spacing:.24em;text-transform:uppercase;color:%MUTED%}'''
TOC_CSS = TOC_CSS.replace('%BG%', BG).replace('%INK%', INK).replace('%PAPER%', PAPER).replace('%LINE%', LINE).replace('%TAUPE%', TAUPE).replace('%MUTED%', MUTED)
rows = ''.join(f'<a class="row" href="#step-{i+1}"><span class="n">{i+1}</span><span><div class="t">{t}</div></span></a>' for i, (t, u) in enumerate(PARTS))
TOC = f'<meta charset="utf-8">{FONTS}<title>The 2027 guide, in nine steps</title><style>{TOC_CSS}</style><div class="card"><div class="script">inside</div><h1>Your 2027 guide,<br>in <em>nine steps</em></h1>{rows}<div class="foot"><span>Do them in order or skip around</span><span>The VIRI Edit</span></div></div>'
open(os.path.join(D, 'toc.html'), 'w', encoding='utf-8').write(TOC)
shoot('toc', TOC, 1200, 1120)

# ---------- Step 1: a Pick a Card banner (links to the full deck) ----------
CARD_CSS = '''.card{position:relative;aspect-ratio:5/7;border-radius:8px;display:grid;place-items:center;box-shadow:inset 0 0 0 1px rgba(59,50,42,.14)}
.card::before{content:"";position:absolute;inset:7%;border:1px solid currentColor;opacity:.45;border-radius:3px}
.card b{font:400 36px/1 'Bodoni Moda',serif;letter-spacing:.1em;padding-left:.1em}'''
five = [('#8C3B2E', CREAM), ('#5a4433', CREAM), ('#7d6d60', CREAM), ('#c9bcae', INK), ('#fbf9f5', INK)]
cs = ''.join(f'<div class="card" style="background:{c};color:{t}"><b>VIRI</b></div>' for c, t in five)
STEP1 = f'''<meta charset="utf-8">{FONTS}<style>*{{box-sizing:border-box;margin:0}}body{{width:1200px;height:800px;background:{BG};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}}
.s{{font:400 64px/1 'Mea Culpa',cursive;color:{TAUPE}}}h2{{font:400 72px/1 'Bodoni Moda',serif;color:{INK};margin:8px 0 14px}}h2 em{{font-style:italic}}
p{{font:400 21px/1.4 'Jost',sans-serif;color:{MUTED};letter-spacing:.01em;margin-bottom:46px}}
.row{{display:flex;gap:26px;width:1000px}}.row .card{{flex:1}}{CARD_CSS}
.f{{margin-top:40px;font:500 16px/1 'Jost',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:{MUTED}}}</style>
<div class="s">want more questions?</div><h2>Pick a <em>card</em></h2><p>24 reflection questions, three decks. Free on vitalityritual.org.</p><div class="row">{cs}</div><div class="f">The VIRI Edit</div>'''
shoot('step1-pick-a-card', STEP1, 1200, 800)

# ---------- Step 2: the wheel of life areas, three highlighted ----------
AREAS = ['Health', 'Career', 'Money', 'Relationships', 'Learning', 'Fun']
# index -> (tag, fill, text colour); the three highlighted areas are just an example
PICKS = {0: ('', '#8C3B2E', CREAM), 1: ('', '#8C3B2E', CREAM), 5: ('', '#8C3B2E', CREAM)}
cx = cy = 600; R = 372; r = 168
def pt(a, rad):
    t = math.radians(a)
    return cx + rad * math.sin(t), cy - rad * math.cos(t)
segs = ''; tags = ''
for i, name in enumerate(AREAS):
    a0, a1 = i * 60, (i + 1) * 60
    x0, y0 = pt(a0, R); x1, y1 = pt(a1, R); x2, y2 = pt(a1, r); x3, y3 = pt(a0, r)
    fill, tc = (PICKS[i][1], PICKS[i][2]) if i in PICKS else (PAPER, '#8a7d70')
    segs += f'<path d="M{x0:.1f} {y0:.1f} A{R} {R} 0 0 1 {x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f} A{r} {r} 0 0 0 {x3:.1f} {y3:.1f}Z" fill="{fill}" stroke="{BG}" stroke-width="7"/>'
    mx, my = pt(a0 + 30, (R + r) / 2)
    segs += f'<text x="{mx:.1f}" y="{my + 10:.1f}" text-anchor="middle" font-family="Bodoni Moda,serif" font-size="31" fill="{tc}">{name}</text>'
    if i in PICKS and PICKS[i][0]:
        tx, ty = pt(a0 + 30, R + 52)
        anchor = 'start' if tx > cx else 'end'
        tags += f'<text x="{tx:.1f}" y="{ty + 14:.1f}" text-anchor="{anchor}" font-family="Mea Culpa,cursive" font-size="64" fill="{PICKS[i][1] if i != 5 else "#a98266"}">{PICKS[i][0]}</text>'
WHEEL = f'''<meta charset="utf-8">{FONTS}<style>*{{margin:0}}body{{width:1200px;height:1200px;background:{BG}}}</style>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
<text x="600" y="92" text-anchor="middle" font-family="Mea Culpa,cursive" font-size="64" fill="{TAUPE}">pick three</text>
{segs}{tags}
<circle cx="600" cy="600" r="150" fill="{PAPER}" stroke="{LINE}" stroke-width="1.5"/>
<text x="600" y="618" text-anchor="middle" font-family="Bodoni Moda,serif" font-size="66" fill="{INK}">2027</text>
<text x="600" y="660" text-anchor="middle" font-family="Jost,sans-serif" font-weight="500" font-size="15" letter-spacing="4.5" fill="{MUTED}">YOUR THEMES</text>
<text x="600" y="1150" text-anchor="middle" font-family="Mea Culpa,cursive" font-size="50" fill="{TAUPE}">just an example. yours will look different.</text>
</svg>'''
shoot('step2-life-areas', WHEEL, 1200, 1200)

# ---------- Steps 3-8 and the conclusion ----------
from string import Template
WINE = '#8C3B2E'; BROWN = '#5a4433'
def T(s, **kw):
    d = dict(BG=BG, PAPER=PAPER, INK=INK, MUTED=MUTED, TAUPE=TAUPE, LINE=LINE, CREAM=CREAM, WINE=WINE, BROWN=BROWN)
    d.update(kw)
    return Template(s).safe_substitute(d)
BASE = '''*{box-sizing:border-box;margin:0}
body{background:$BG;font-family:'Jost',sans-serif;color:$INK;display:flex;flex-direction:column;align-items:center}
.s{font:400 64px/1 'Mea Culpa',cursive;color:$TAUPE}
h2{font:400 64px/1.05 'Bodoni Moda',serif;letter-spacing:-.01em;text-align:center;margin-top:6px}h2 em{font-style:italic}
.p{font:400 22px/1.4 'Jost',sans-serif;color:$MUTED;text-align:center}
.f{font:500 15px/1 'Jost',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:$MUTED}
.k{font:500 14px/1 'Jost',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:$MUTED}
.b{font:400 34px/1.15 'Bodoni Moda',serif}'''
def page(w, h, css, body, pad=60):
    return T(f'<meta charset="utf-8">{FONTS}<style>{BASE}body{{width:{w}px;height:{h}px;padding:{pad}px 0 48px}}{css}</style>{body}')

# Step 3: a goal with a bad-week version
sq = lambda n, tot, col: ''.join(f'<i style="background:{col}"></i>' if k < n else '<i class="e"></i>' for k in range(tot))
S3 = page(1200, 700, '''.row{display:flex;gap:36px;margin-top:44px}
.card{width:470px;background:$PAPER;border:1px solid $LINE;padding:40px 44px 44px}
.card .b{margin:22px 0 34px;font-size:40px}
.sq{display:flex;gap:14px}.sq i{width:64px;height:64px;display:block}.sq i.e{border:1.5px solid #b8ab9d}
.g{margin-top:38px;font:400 22px/1 'Jost',sans-serif;letter-spacing:.02em;color:$MUTED}.g b{font-weight:500;color:$INK}
.z{margin-top:40px;font:400 54px/1 'Mea Culpa',cursive;color:$TAUPE}''',
f'''<div class="s">the bad-week version</div><h2>Never drop to <em>zero</em></h2>
<div class="g"><b>The goal:</b> strength train</div>
<div class="row"><div class="card"><div class="k">Normal week</div><div class="b">Three workouts</div><div class="sq">{sq(3,3,BROWN)}</div></div>
<div class="card"><div class="k" style="color:{WINE}">Bad week</div><div class="b">One ten-minute walk</div><div class="sq">{sq(1,3,WINE)}</div></div></div>
<div class="z">same goal. just a smaller version.</div>''')
shoot('step3-bad-week', S3, 1200, 700)

# Step 4: how to size the photos on the board (no photos, just the layout idea)
tiles = [(0,0,300,380,'#c9bcae',INK,'big','' ),(312,0,200,180,WINE,CREAM,'your word','<span style="font:400 64px/1 \'Mea Culpa\',cursive">ease</span>'),
 (524,0,436,180,'#e8e3db',INK,'a quote','<span style="font:italic 400 27px/1.2 \'Bodoni Moda\',serif">&ldquo;something you&rsquo;d say to yourself on a hard day&rdquo;</span>'),
 (312,192,200,188,'#7d6d60',CREAM,'small',''),(524,192,200,188,'#d6cec2',INK,'your color',''),(736,192,224,88,BROWN,CREAM,'small',''),(736,292,224,88,'#c9bcae',INK,'small',''),
 (0,392,200,208,'#e8e3db',INK,'medium',''),(212,392,380,208,'#d6cec2',INK,'big',''),(604,392,356,208,'#7d6d60',CREAM,'medium','')]
tl = ''.join(f'<div class="t" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:{bg};color:{fg}"><div class="mid">{mid}</div><div class="lb">{lb}</div></div>' for x,y,w,h,bg,fg,lb,mid in tiles)
S4 = page(1200, 1060, '''.board{position:relative;width:1000px;height:640px;background:$PAPER;border:1px solid $LINE;margin-top:40px}
.in{position:absolute;inset:20px}.t{position:absolute;padding:16px 18px}.t .mid{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:0 24px}
.t .lb{position:absolute;left:16px;bottom:14px;font:500 12px/1 'Jost',sans-serif;letter-spacing:.2em;text-transform:uppercase;opacity:.8}
.cap{margin-top:34px}''',
f'''<div class="s">mix your sizes</div><h2>Big for what matters,<br><em>small</em> for the rest</h2>
<div class="board"><div class="in">{tl}</div></div>
<p class="p cap">Print each photo at a different size, then play with the layout before you glue anything down.</p>''', pad=56)
shoot('step4-board-layout', S4, 1200, 1060)

# Step 5: habit stacking
arrow = '<svg width="74" height="28" viewBox="0 0 74 28"><path d="M2 14H68M56 4l12 10-12 10" fill="none" stroke="#7d6d60" stroke-width="2"/></svg>'
ex = [('pour my morning coffee', 'write down my top three'), ('get into bed', 'read ten pages'), ('finish dinner', 'take a ten-minute walk')]
rws = ''.join(f'<div class="r"><div class="c a"><div class="k">After I</div><div class="b">{a}</div></div>{arrow}<div class="c w"><div class="k" style="color:{CREAM};opacity:.8">I will</div><div class="b">{b}</div></div></div>' for a, b in ex)
S5 = page(1200, 730, '''.rs{margin-top:46px;display:flex;flex-direction:column;gap:22px}
.r{display:flex;align-items:center;gap:26px}.c{width:440px;height:128px;padding:26px 32px;display:flex;flex-direction:column;justify-content:space-between}
.a{background:$PAPER;border:1px solid $LINE}.w{background:$WINE;color:$CREAM}
.b{font-size:31px}''',
f'''<div class="s">habit stacking</div><h2>After I&nbsp;<em>&hellip;</em>, I will&nbsp;<em>&hellip;</em></h2><div class="rs">{rws}</div>''')
shoot('step5-habit-stack', S5, 1200, 730)

# Step 6: the year on one page (Q1 filled in as an example, the rest to fill in)
Q = [('Q1', 'Jan &ndash; Mar', ['Three workouts a week for a month', 'Finish the first skill project', 'Book one trip or event'], 'Habit 1: Jan 1', 'Mar 31'),
     ('Q2', 'Apr &ndash; Jun', None, 'Habit 2: Mar 1', 'Jun 30'), ('Q3', 'Jul &ndash; Sep', None, 'Next habit:', 'Sep 30'), ('Q4', 'Oct &ndash; Dec', None, 'Next habit:', 'Dec 31')]
cards = ''
for q, mo, ms, hab, rev in Q:
    rows6 = ''
    for i, th in enumerate(['Health', 'Career', 'Fun']):
        txt = ms[i] if ms else ''
        rows6 += f'<div class="m"><div class="k">{th}</div><div class="v">{txt}</div></div>'
    cards += f'<div class="q"><div class="qh"><span class="qn">{q}</span><span class="k">{mo}</span></div>{rows6}<div class="m h"><div class="k">New habit starts</div><div class="v">{hab if q=="Q1" else ""}</div></div><div class="rv"><span class="k">Review</span><span class="b" style="font-size:24px">{rev}</span></div></div>'
S6 = page(1200, 1010, '''.g{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;width:1090px;margin-top:40px}
.q{background:$PAPER;border:1px solid $LINE;padding:26px 22px 22px;display:flex;flex-direction:column}
.qh{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px}.qn{font:italic 400 54px/1 'Bodoni Moda',serif;color:$TAUPE}
.m{margin-top:20px}.v{font:400 22px/1.25 'Bodoni Moda',serif;min-height:84px;border-bottom:1px solid $LINE;padding:10px 0 8px}
.m.h .v{min-height:30px;color:$WINE}.rv{margin-top:26px;display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid $INK;padding-top:16px}
.rest{width:1090px;margin-top:18px;border:1px solid $WINE;color:$WINE;padding:22px 28px;display:flex;justify-content:space-between;align-items:center}
.rest .b{font-size:26px;font-style:italic}''',
f'''<div class="s">your year on one page</div><h2 style="font-size:56px">Four quarters, <em>one</em> milestone each</h2>
<div class="g">{cards}</div><div class="rest"><span class="k" style="color:{WINE}">Block it now</span><span class="b">A few days of rest, scheduled before the year fills up.</span></div>''', pad=52)
shoot('step6-year', S6, 1200, 1010)

# Step 7: the not-doing list
nd = [('No phone in bed', 'read ten pages'), ('No work email after 7 PM', 'take a ten-minute walk'), ('No yes to plans I don&rsquo;t want', 'a &ldquo;not right now&rdquo;')]
no = '<svg width="38" height="38" viewBox="0 0 38 38"><circle cx="19" cy="19" r="16" fill="none" stroke="#8C3B2E" stroke-width="2"/><path d="M8 30L30 8" stroke="#8C3B2E" stroke-width="2"/></svg>'
rw7 = ''.join(f'<div class="r">{no}<div class="b" style="flex:1">{a}</div><div class="in"><div class="k">Instead</div><div class="b" style="font-size:27px;font-style:italic">{b}</div></div></div>' for a, b in nd)
S7 = page(1200, 710, '''.card{margin-top:44px;width:1000px;background:$PAPER;border:1px solid $LINE;padding:14px 48px}
.r{display:flex;align-items:center;gap:26px;padding:34px 0;border-top:1px solid $LINE}.r:first-child{border-top:0}.in{width:340px;display:flex;flex-direction:column;gap:12px;border-left:1px solid $LINE;padding-left:30px}''',
f'''<div class="s">the other list</div><h2>What you&rsquo;re <em>not</em> doing in 2027</h2><div class="card">{rw7}</div>''')
shoot('step7-not-doing', S7, 1200, 710)

# Step 8 (and a printable): a blank one-page My 2027 (letter ratio)
col = ''.join(f'<div class="th"><div class="k">Theme {n}</div><div class="ln"></div><div class="k mt">Goal</div><div class="ln"></div><div class="ln"></div><div class="k mt">Bad-week version</div><div class="ln"></div><div class="k mt">Why</div><div class="ln"></div><div class="ln"></div></div>' for n in (1, 2, 3))
qcol = ''.join(f'<div><div class="k">Q{n}</div><div class="ln"></div><div class="ln"></div></div>' for n in (1, 2, 3, 4))
S8 = page(1275, 1650, '''.pg{width:1075px;margin-top:20px;display:flex;flex-direction:column;gap:40px}
.ln{height:50px;border-bottom:1.5px solid #b8ab9d}body{background:$PAPER}.mt{margin-top:20px}
.w{display:flex;align-items:flex-end;gap:30px}.w .ln{flex:1;height:96px}.big{font:400 40px/1 'Mea Culpa',cursive;color:$TAUPE}
.ths{display:grid;grid-template-columns:repeat(3,1fr);gap:34px}.th .k{margin-bottom:2px}
.qs{display:grid;grid-template-columns:repeat(4,1fr);gap:26px}.row2{display:grid;grid-template-columns:1fr 1fr;gap:44px}.hr{border-top:1px solid $INK;padding-top:16px}''',
f'''<div class="s" style="font-size:74px">my</div><h2 style="font-size:96px;margin-top:-4px">2027</h2>
<div class="pg"><div class="w"><span class="k" style="padding-bottom:14px">My word</span><div class="ln"></div></div>
<div><div class="hr k">My themes and goals</div><div class="ths" style="margin-top:24px">{col}</div></div>
<div><div class="hr k">Milestones by quarter</div><div class="qs" style="margin-top:24px">{qcol}</div></div>
<div class="row2"><div><div class="hr k">Not doing</div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>
<div><div class="hr k">First habit</div><div class="k mt" style="margin-top:24px">After I</div><div class="ln"></div><div class="k mt">I will</div><div class="ln"></div><div class="k mt">Weekly reset: day and time</div><div class="ln"></div><div class="k mt">Rest days to block</div><div class="ln"></div></div></div></div>
<div class="f" style="margin-top:auto;padding-top:30px">The VIRI Edit &nbsp;&middot;&nbsp; vitalityritual.org</div>''', pad=70)
shoot('step8-my-2027-printable', S8, 1275, 1650)

# Conclusion: start this week
todo = [('Write down your themes and your word', 'Step 2'), ('Pick your first habit and its trigger', 'Step 5'),
        ('Put your weekly reset on your calendar', 'Step 6'), ('Start your 2027 Pinterest board', 'Step 4')]
bx = ''.join(f'<div class="r"><i></i><div class="b" style="flex:1">{t}</div><span class="k">{n}</span></div>' for t, n in todo)
S9 = page(1200, 770, '''.card{margin-top:44px;width:1000px;background:$PAPER;border:1px solid $LINE;padding:12px 48px}
.r{display:flex;align-items:center;gap:30px;padding:30px 0;border-top:1px solid $LINE}.r:first-child{border-top:0}
.r i{width:34px;height:34px;border:2px solid $BROWN;display:block;flex:none}''',
f'''<div class="s">your first week</div><h2>Start <em>this</em> week</h2><div class="card">{bx}</div>''')
shoot('conclusion-first-week', S9, 1200, 770)

# Word generator, compact picture (what Substack shows instead of the interactive tool)
AREAS_C = ['Health', 'Career', 'Money', 'Relationships', 'Learning', 'Fun']
MORE_C = ['Rest', 'Creating', 'Moving', 'Saving', 'Connecting', 'Finishing', 'Simplifying', 'Starting', 'Saying no', 'Playing', 'Building']
FEEL_C = ['Calm', 'Confident', 'Energized', 'Free', 'Grounded', 'Focused', 'Playful', 'Brave', 'Soft', 'Organized', 'Light', 'Abundant']
col = lambda q, items: f'<div class="col"><div class="q">{q}</div><div class="ch">' + ''.join(f'<span>{i}</span>' for i in items) + '</div></div>'
WG = page(1200, 560, '''.card{width:1080px;background:$PAPER;border:1px solid $LINE;padding:34px 44px 32px;margin-top:6px}
.hd{display:flex;align-items:baseline;gap:18px}.hd .s{font-size:44px}.hd .b{font-size:40px}.hd em{font-style:italic}
.cols{display:grid;grid-template-columns:1fr 1.15fr 1.15fr;gap:34px;margin-top:22px;border-top:1px solid $LINE;padding-top:20px}
.q{font:400 22px/1.2 'Bodoni Moda',serif}.ch{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.ch span{font:400 15px/1 'Jost',sans-serif;border:1px solid #bfb1a3;border-radius:999px;padding:9px 14px;background:$PAPER}
.go{display:flex;align-items:center;gap:20px;margin-top:26px;border-top:1px solid $LINE;padding-top:22px}
.go b{font:500 13px/1 'Jost',sans-serif;letter-spacing:.16em;text-transform:uppercase;background:$INK;color:$PAPER;border-radius:999px;padding:16px 26px}
.go i{font:400 16px/1 'Jost',sans-serif;color:$MUTED;font-style:normal}''',
f'''<div class="card"><div class="hd"><span class="s">need some help?</span><span class="b">Find your <em>2027 word</em></span></div>
<div class="cols">{col('What matters most right now?', AREAS_C)}{col('What do you want more of?', MORE_C)}{col('How do you want to feel?', FEEL_C)}</div>
<div class="go"><b>Find my word</b><i>Interactive on vitalityritual.org</i></div></div>''', pad=40)
shoot('wordgen-compact', WG, 1200, 560)
