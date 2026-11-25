# Substack cover for "The Ultimate Guide to Making 2027 Your Best Year Yet" (1200x630).
# Masthead layout on white (her pick, 25 Nov 2026): huge Bodoni "2027", Mea Culpa line, thin rules.
#   python3 substack/covers/make-guide-2027.py
import subprocess, os
D=os.path.dirname(os.path.abspath(__file__))
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
html='''<meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Mea+Culpa&display=swap">
<style>*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;position:relative;overflow:hidden;background:#ffffff;color:#3b322a}
.cap{font:400 14px/1 'Bodoni Moda',serif;letter-spacing:.3em;text-transform:uppercase}
.top{position:absolute;left:60px;right:60px;top:56px;display:flex;justify-content:space-between;color:#5a4433}
.rl{position:absolute;left:60px;right:60px;height:1px;background:#3b322a}
.big{position:absolute;left:0;right:0;top:96px;text-align:center;font:400 250px/1 'Bodoni Moda',serif;letter-spacing:.06em;padding-left:.06em;color:#3b322a}
.s{position:absolute;left:0;right:0;top:370px;text-align:center;font:400 96px/1 'Mea Culpa',cursive;color:#7d6d60}
.bot{position:absolute;left:60px;right:60px;bottom:50px;display:flex;justify-content:space-between;color:#5a4433}</style>
<div class="top cap"><span>The VIRI Edit</span><span>A free guide</span></div><div class="rl" style="top:92px"></div>
<div class="big">2027</div><div class="s">your best year yet</div>
<div class="rl" style="bottom:92px"></div><div class="bot cap"><span>The ultimate guide</span><span>Nine steps</span><span>vitalityritual.org</span></div>'''
f=os.path.join(D,'guide-2027-cover-source.html'); open(f,'w',encoding='utf-8').write(html)
subprocess.run([CHROME,'--headless=new','--disable-gpu','--hide-scrollbars','--force-prefers-color-scheme=light','--virtual-time-budget=8000','--window-size=1200,630','--screenshot='+os.path.join(D,'substack-guide-2027.png'),'file://'+f],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
os.remove(f); print('ok')
