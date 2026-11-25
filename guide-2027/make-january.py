# Mock January 2027 calendar for Margaret's personal Step 6 (built from Steps 1-5 of her "My 2027" example).
#   python3 make-january.py        -> january-2027-calendar.png (next to this script)
# Everything she may want to change is in the CONFIG block below.
import subprocess, os, datetime
D = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@400;500&family=Mea+Culpa&display=swap">'
BG = '#e9e4dc'; PAPER = '#fbf9f5'; INK = '#3b322a'; MUTED = '#665a4e'; TAUPE = '#7d6d60'; LINE = '#d6cec2'; CREAM = '#f4efe8'
HEALTH = '#8C3B2E'; MONEY = '#5f6f52'; LEARN = '#4e6479'; LIFE = '#8a7a6c'

# ---------------- CONFIG ----------------
LONG_RUN_MILES = {2: 10, 9: 12, 16: 14, 23: 10, 30: 15}   # Saturdays; Jan 23 is a cutback week
CUTBACK_WEEK_START = 17                                    # Sunday of the cutback week (weeks run Sun-Sat)
INVEST_DAYS = (3, 10, 17, 24)   # Sundays that get a small transfer
INVEST_EACH = 208               # x4 = $832, about $10,000 / 12
# ----------------------------------------

def tint(hexc, a):
    h = hexc.lstrip('#'); r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f'rgba({r},{g},{b},{a})'

def chip(text, col, sub='', solid=False):
    st = f'background:{col};color:{CREAM};border-left-color:{col}' if solid else f'background:{tint(col, .13)};border-left-color:{col}'
    s = f'<span class="sub" style="{"color:"+CREAM+";opacity:.8" if solid else ""}">{sub}</span>' if sub else ''
    return f'<div class="chip" style="{st}">{text}{s}</div>'

def sd(day):  # 0 Sun ... 6 Sat
    return (datetime.date(2027, 1, day).weekday() + 1) % 7

def events(day):
    w = sd(day); ev = []
    cut = CUTBACK_WEEK_START <= day < CUTBACK_WEEK_START + 7
    if w == 0:
        ev.append(chip('Recovery run', HEALTH))
        ev.append(chip('Meal prep', HEALTH, 'groceries, vegetables first'))
        save = f'30 min &middot; invest ${INVEST_EACH}' if day in INVEST_DAYS else '30 min &middot; $50+ wait list'
        ev.append(chip('Budget tracker', MONEY, save))
        if day == 31: ev.append(chip('Monthly check-in', LIFE, '30 min &middot; finish book #1'))
        else: ev.append(chip('Weekly reset &middot; 15 min', LIFE))
    if w == 1: ev.append(chip('Strength training', HEALTH, 'morning'))
    if w == 2: ev.append(chip('Easy run', HEALTH, 'out the door in 45 min'))
    if w == 3: ev.append(chip('Wharton certificate', LEARN, 'one study session'))
    if w == 4: ev.append(chip('Easy run' if cut else 'Tempo run', HEALTH, 'morning'))
    if w == 6: ev.append(chip(f'Long run &middot; {LONG_RUN_MILES[day]} mi', HEALTH, 'cutback week' if cut else '', solid=True))
    if day == 1:
        ev.append(chip('Word on the wall', LIFE, 'INVEST'))
        ev.append(chip('Build my vision board', LIFE, 'start on Pinterest'))
    return ''.join(ev)

def cell(day):
    rest = '<div class="rest">rest day</div>' if sd(day) == 5 else ''
    return (f'<div class="cell"><div class="top"><span class="n">{day}</span><span class="dot"></span></div>'
            f'<div class="ev">{events(day)}</div>{rest}</div>')

head = ''.join(f'<div class="dh">{n}</div>' for n in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
intro = '''<div class="intro"><div class="s">my word for 2027</div><div class="word">INVEST</div>
<div class="th"><span style="color:%s">Health</span><i>&middot;</i><span style="color:%s">Money</span><i>&middot;</i><span style="color:%s">Learning</span></div></div>''' % (HEALTH, MONEY, LEARN)
cells = intro + ''.join(cell(d) for d in range(1, 32))

legend = ''.join(f'<span class="lg"><i style="background:{c}"></i>{t}</span>' for c, t in
                 [(HEALTH, 'Health: running, strength, food'), (MONEY, 'Money'), (LEARN, 'Learning'), (LIFE, 'Life: check-ins and setup')])
legend += '<span class="lg"><b class="dot"></b>Read 5+ pages before bed</span>'

daily = ''.join(f'<div class="dl"><div class="k">{k}</div><div class="v">{v}</div></div>' for k, v in [
    ('Every morning', 'Out the door within 45 minutes of waking, even if it is not the full workout'),
    ('Every night', 'Read, even just 5 pages, before bed. One book by January 31'),
    ('Every day', '64 oz of water and vegetables with at least one meal'),
    ('Every purchase over $50', 'Wait a full week before you buy')])

HTML = f'''<meta charset="utf-8">{FONTS}<style>
*{{box-sizing:border-box;margin:0}}
body{{width:1600px;background:{BG};font-family:'Jost',sans-serif;color:{INK};padding:64px 60px 56px;display:flex;flex-direction:column;align-items:center}}
.s{{font:400 58px/1 'Mea Culpa',cursive;color:{TAUPE}}}
h1{{font:400 76px/1.05 'Bodoni Moda',serif;letter-spacing:-.01em;margin-top:4px}}h1 em{{font-style:italic}}
.lead{{font:400 23px/1.4 'Jost',sans-serif;color:{MUTED};margin-top:14px}}
.leg{{display:flex;gap:34px;margin:30px 0 24px;flex-wrap:wrap;justify-content:center}}
.lg{{display:flex;align-items:center;gap:10px;font:400 17px/1 'Jost',sans-serif;color:{MUTED}}}.lg i{{width:6px;height:22px;display:block}}
.dot{{display:inline-block;width:15px;height:15px;border:1.5px solid #a99b8c;border-radius:50%}}
.grid{{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;width:1480px}}
.dh{{font:500 14px/1 'Jost',sans-serif;letter-spacing:.24em;text-transform:uppercase;color:{MUTED};text-align:center;padding-bottom:6px}}
.intro{{grid-column:span 5;background:{PAPER};border:1px solid {LINE};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}}
.word{{font:400 92px/1 'Bodoni Moda',serif;letter-spacing:.14em;padding-left:.14em;color:{INK}}}
.th{{display:flex;gap:16px;align-items:center;font:500 15px/1 'Jost',sans-serif;letter-spacing:.24em;text-transform:uppercase;margin-top:12px}}.th i{{color:{TAUPE};font-style:normal}}
.cell{{background:{PAPER};border:1px solid {LINE};padding:12px 10px 10px;min-height:190px;display:flex;flex-direction:column;position:relative}}
.top{{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}}
.n{{font:400 32px/1 'Bodoni Moda',serif;color:{TAUPE}}}
.ev{{display:flex;flex-direction:column;gap:5px}}
.chip{{border-left:4px solid;padding:5px 8px 5px 9px;font:500 15.5px/1.2 'Jost',sans-serif}}
.sub{{display:block;font:400 12.5px/1.25 'Jost',sans-serif;color:{MUTED};margin-top:2px}}
.rest{{margin-top:auto;font:400 25px/1 'Mea Culpa',cursive;color:{TAUPE};padding-top:6px}}
.daily{{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:1480px;margin-top:22px}}
.dl{{background:{PAPER};border:1px solid {LINE};padding:20px 22px 22px}}
.k{{font:500 13px/1 'Jost',sans-serif;letter-spacing:.24em;text-transform:uppercase;color:{HEALTH}}}
.v{{font:400 22px/1.25 'Bodoni Moda',serif;margin-top:12px}}
.fill{{grid-column:span 6;display:flex;align-items:center;justify-content:center;font:400 44px/1 'Mea Culpa',cursive;color:{TAUPE}}}
.foot-unused{{font:400 40px/1 'Mea Culpa',cursive;color:{TAUPE};margin-top:26px}}
</style>
<div class="s">a mock month</div><h1>My <em>January</em> 2027</h1>
<div class="lead">The plan from Steps 1 through 5, on one calendar. April marathon, a 3:20 to chase.</div>
<div class="leg">{legend}</div>
<div class="grid">{head}{cells}</div>
<div class="daily">{daily}</div>
'''

f = os.path.join(D, 'january-source.html'); open(f, 'w', encoding='utf-8').write(HTML)
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-prefers-color-scheme=light',
                '--virtual-time-budget=8000', '--window-size=1600,2000', f'--screenshot={os.path.join(D, "january-2027-calendar.png")}', 'file://' + f],
               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
os.remove(f); print('ok')
