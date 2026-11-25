# Substack cover for "The 7 D.C. Restaurants You Need to Take Your Foodie Friend" (1200x630).
# Big-number layout (flat espresso ground), deliberately unlike the striped-card covers.
#   python3 substack/covers/make-dc-restaurants.py
import subprocess, os
D=os.path.dirname(os.path.abspath(__file__))
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
html='''<meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=EB+Garamond:ital@1&family=Mea+Culpa&display=swap">
<style>*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#3b322a;color:#f4efe8;position:relative;overflow:hidden}
.frame{position:absolute;inset:26px;border:1px solid rgba(244,239,232,.35)}
.t{position:absolute;top:52px;font:400 13px/1 'Bodoni Moda',serif;letter-spacing:.3em;text-transform:uppercase;color:rgba(244,239,232,.78)}.l{left:60px}.r{right:60px}
.num{position:absolute;left:0;width:500px;top:70px;text-align:center;font:400 470px/1 'Mea Culpa',cursive;color:#f4efe8}
.rule{position:absolute;left:560px;top:150px;bottom:150px;width:1px;background:rgba(244,239,232,.35)}
.k1{position:absolute;left:600px;top:206px;font:400 56px/1.08 'Bodoni Moda',serif;letter-spacing:.04em;text-transform:uppercase}
.k2{position:absolute;left:600px;top:352px;font:italic 400 34px/1.2 'EB Garamond',serif;color:rgba(244,239,232,.92)}
.b{position:absolute;bottom:52px;left:600px;font:400 13px/1 'Bodoni Moda',serif;letter-spacing:.3em;text-transform:uppercase;color:rgba(244,239,232,.78)}</style>
<div class="frame"></div><span class="t l">The VIRI Edit</span><span class="t r">Washington, D.C.</span>
<div class="num">7</div><div class="rule"></div>
<div class="k1">D.C.<br>Restaurants</div><div class="k2">to take your foodie friend</div><div class="b">vitalityritual.org</div>'''
f=os.path.join(D,'dc-restaurants-cover-source.html'); open(f,'w',encoding='utf-8').write(html)
subprocess.run([CHROME,'--headless=new','--disable-gpu','--hide-scrollbars','--force-prefers-color-scheme=light','--virtual-time-budget=8000','--window-size=1200,630','--screenshot='+os.path.join(D,'substack-dc-restaurants.png'),'file://'+f],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
os.remove(f); print('ok')
