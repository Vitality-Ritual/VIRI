# Three alternative Substack covers for the 2027 guide (1200x630), for her to choose from.
import subprocess, os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'guide-options')
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HEAD='''<meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=EB+Garamond:ital@0;1&family=Mea+Culpa&display=swap"><style>*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;position:relative;overflow:hidden}
.cap{font:400 14px/1 'Bodoni Moda',serif;letter-spacing:.3em;text-transform:uppercase}.abs{position:absolute}</style>'''
A=HEAD+'''<style>body{background:#f4efe8;color:#3b322a}.f1{position:absolute;inset:26px;border:1px solid #bfb1a3}.f2{position:absolute;inset:38px;border:1px solid #d6cec2}
.y{position:absolute;left:0;right:0;top:112px;text-align:center;font:400 215px/1 'Mea Culpa',cursive;color:#5a4433}
.k{position:absolute;left:0;right:0;top:372px;text-align:center;font-size:19px;letter-spacing:.3em;color:#6e6055;padding-left:.3em}
.h{position:absolute;left:0;right:0;top:410px;text-align:center;font:italic 400 62px/1 'EB Garamond',serif}
.t{position:absolute;top:72px;left:0;right:0;text-align:center;color:#6e6055}.b{position:absolute;bottom:72px;left:0;right:0;text-align:center;color:#6e6055}</style>
<div class="f1"></div><div class="f2"></div><div class="cap t">The VIRI Edit &nbsp;·&nbsp; A free guide</div>
<div class="y">2027</div><div class="cap k">The ultimate guide to making your</div><div class="h">best year yet</div><div class="cap b">Nine steps</div>'''
B=HEAD+'''<style>body{background:#5a4433;color:#f4efe8}
.t{position:absolute;top:56px;left:70px;opacity:.78}.r{position:absolute;top:56px;right:70px;opacity:.78}
.q{position:absolute;left:70px;right:70px;top:170px;font:italic 400 108px/1.04 'EB Garamond',serif}
.s{position:absolute;left:70px;top:420px;font:400 26px/1.4 'Bodoni Moda',serif;letter-spacing:.06em;opacity:.9}
.b{position:absolute;left:70px;bottom:56px;opacity:.78}</style>
<div class="cap t">The VIRI Edit</div><div class="cap r">Free guide</div>
<div class="q">make 2027<br>your best year yet.</div><div class="s">The ultimate guide, in nine steps</div><div class="cap b">vitalityritual.org</div>'''
C=HEAD+'''<style>body{background:#d6cec2;color:#3b322a}
.top{position:absolute;left:60px;right:60px;top:56px;display:flex;justify-content:space-between;color:#5a4433}
.rl{position:absolute;left:60px;right:60px;height:1px;background:#3b322a}
.big{position:absolute;left:0;right:0;top:96px;text-align:center;font:400 250px/1 'Bodoni Moda',serif;letter-spacing:.06em;padding-left:.06em;color:#3b322a}
.s{position:absolute;left:0;right:0;top:370px;text-align:center;font:400 96px/1 'Mea Culpa',cursive;color:#7d6d60}
.bot{position:absolute;left:60px;right:60px;bottom:50px;display:flex;justify-content:space-between;color:#5a4433}</style>
<div class="top cap"><span>The VIRI Edit</span><span>A free guide</span></div><div class="rl" style="top:92px"></div>
<div class="big">2027</div><div class="s">your best year yet</div>
<div class="rl" style="bottom:92px"></div><div class="bot cap"><span>The ultimate guide</span><span>Nine steps</span><span>vitalityritual.org</span></div>'''
for n,h in (('a-framed',A),('b-cocoa',B),('c-masthead',C)):
    f=os.path.join(D,n+'-src.html'); open(f,'w',encoding='utf-8').write(h)
    subprocess.run([CHROME,'--headless=new','--disable-gpu','--hide-scrollbars','--force-prefers-color-scheme=light','--virtual-time-budget=8000','--window-size=1200,630','--screenshot='+os.path.join(D,n+'.png'),'file://'+f],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    os.remove(f)
cells=''.join(f'<div><img src="file://{D}/{n}.png"><p>{l}</p></div>' for n,l in (('a-framed','A'),('b-cocoa','B'),('c-masthead','C')))
f=os.path.join(D,'sheet.html'); open(f,'w').write(f'<meta charset="utf-8"><style>body{{margin:0;background:#efe9e1;width:1260px;padding:30px;font-family:Georgia}}div{{margin-bottom:26px}}img{{width:1200px;display:block;box-shadow:0 2px 12px rgba(0,0,0,.18)}}p{{font:700 28px Arial;margin:8px 0 0}}</style>{cells}')
subprocess.run([CHROME,'--headless=new','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files','--virtual-time-budget=8000','--window-size=1260,2300','--screenshot='+os.path.join(D,'sheet.png'),'file://'+f],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
os.remove(f); print('ok')
