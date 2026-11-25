# Substack cover for "The Ultimate Guide to Making 2027 Your Best Year Yet" (1200x630).
# Split-postcard layout (flat taupe panel + cream panel), deliberately unlike the striped-card covers.
#   python3 substack/covers/make-guide-2027.py
import subprocess, os
D=os.path.dirname(os.path.abspath(__file__))
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
html='''<meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=EB+Garamond:ital@1&family=Mea+Culpa&display=swap">
<style>*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;display:flex;background:#fbf9f5;position:relative;overflow:hidden}
.L{width:520px;height:630px;background:#7d6d60;color:#f4efe8;position:relative}
.L .y{position:absolute;left:0;right:0;top:150px;text-align:center;font:400 150px/1 'Bodoni Moda',serif;letter-spacing:.02em}
.L .s{position:absolute;left:0;right:0;top:330px;text-align:center;font:400 62px/1 'Mea Culpa',cursive;color:#f4efe8}
.L .t{position:absolute;left:44px;top:44px;font:400 12px/1 'Bodoni Moda',serif;letter-spacing:.3em;text-transform:uppercase;opacity:.85}
.R{flex:1;position:relative;color:#3b322a}
.R .k{position:absolute;left:70px;top:150px;font:400 15px/1.7 'Bodoni Moda',serif;letter-spacing:.26em;text-transform:uppercase;color:#6e6055}
.R .h{position:absolute;left:70px;top:222px;font:400 64px/1.12 'Bodoni Moda',serif;letter-spacing:-.005em}.R .h i{font-family:'EB Garamond',serif;font-style:italic}
.R .b{position:absolute;left:70px;bottom:50px;font:400 12px/1 'Bodoni Moda',serif;letter-spacing:.3em;text-transform:uppercase;color:#6e6055}
.R .n{position:absolute;right:50px;top:44px;font:400 12px/1 'Bodoni Moda',serif;letter-spacing:.3em;text-transform:uppercase;color:#6e6055}</style>
<div class="L"><span class="t">The VIRI Edit</span><div class="y">2027</div><div class="s">nine steps</div></div>
<div class="R"><span class="n">Free guide</span><div class="k">The ultimate guide</div><div class="h">to making your<br><i>best year yet</i></div><div class="b">vitalityritual.org</div></div>'''
f=os.path.join(D,'guide-2027-cover-source.html'); open(f,'w',encoding='utf-8').write(html)
subprocess.run([CHROME,'--headless=new','--disable-gpu','--hide-scrollbars','--force-prefers-color-scheme=light','--virtual-time-budget=8000','--window-size=1200,630','--screenshot='+os.path.join(D,'substack-guide-2027.png'),'file://'+f],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
os.remove(f); print('ok')
