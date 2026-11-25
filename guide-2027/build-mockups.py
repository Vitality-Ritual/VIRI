# Builds two self-contained HTML mock-ups of the 2027 guide (nothing is posted anywhere):
#   mockup-website.html   the article as the VIRI site renders it (snapshot of the local build, word generator and TOC mounted)
#   mockup-substack.html  the same article as Substack would show the imported post (plain fallbacks, links back to the site)
# Needs: the local preview server on :8769 serving a copy of website/ (see .claude/launch.json "viri-guide"),
#        and guide-2027/substack-feed-guide-preview.xml (from substack/make-feed.rb).
import os, re, base64, subprocess, html, mimetypes
G = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(os.path.dirname(G), 'website')
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL = "http://localhost:8769/?preview=1#/read/ultimate-guide-2027"
rd = lambda p: open(p, encoding='utf-8').read()

def data_uri(path):
    mt = mimetypes.guess_type(path)[0] or 'image/png'
    return f'data:{mt};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def embed_assets(s, prefix):
    """swap <img src="<prefix>name"> for a data: URI when the file is in website/assets"""
    def one(m):
        name = m.group(2)
        p = os.path.join(W, 'assets', name)
        return f'{m.group(1)}{data_uri(p)}"' if os.path.exists(p) else m.group(0)
    return re.sub(r'(<img[^>]*?src=")' + re.escape(prefix) + r'([^"]+)"', one, s)

# ---------------- website ----------------
dom = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-prefers-color-scheme=light',
                      '--virtual-time-budget=12000', '--window-size=1280,900', '--dump-dom', URL], capture_output=True, text=True).stdout
dom = re.sub(r'<script\b.*?</script>', '', dom, flags=re.S)
css = rd(os.path.join(W, 'styles.css'))
css = css.replace('url(assets/', 'url(file://' + W + '/assets/').replace('url("assets/', 'url("file://' + W + '/assets/').replace("url('assets/", "url('file://" + W + "/assets/")
dom = re.sub(r'<link rel="stylesheet" href="styles\.css[^>]*>', lambda m: '<style>' + css + '</style>', dom)
dom = dom.replace('<head>', '<head><base href="file://' + W + '/">', 1)
dom = embed_assets(dom, 'assets/')
app_js = rd(os.path.join(W, 'app.js'))
mods = re.search(r'/\* GUIDE-2027:start.*?GUIDE-2027:end \*/', app_js, re.S).group(0)
live = '<script>' + mods + "\nWORDGEN.mount(document.getElementById('wordgen-tool'));GUIDE_TOC.mount(document.getElementById('guide-toc'));</script>"
dom = dom.replace('</body>', live + '<div style="position:fixed;left:12px;bottom:12px;z-index:99;background:#3b322a;color:#f4efe8;font:12px/1.3 Jost,sans-serif;letter-spacing:.06em;padding:8px 12px;border-radius:4px;opacity:.88">Mock-up of the website version. The word generator and contents work here. Nothing is published.</div></body>')
open(os.path.join(G, 'mockup-website.html'), 'w', encoding='utf-8').write(dom)

# ---------------- substack ----------------
feed = rd(os.path.join(G, 'substack-feed-guide-preview.xml'))
item = [i for i in feed.split('<item>') if 'viri-ultimate-guide-2027' in i][0]
title = html.unescape(re.search(r'<title>(.*?)</title>', item).group(1))
desc = html.unescape(re.search(r'<description>(.*?)</description>', item).group(1))
body = re.search(r'<!\[CDATA\[(.*)\]\]></content:encoded>', item, re.S).group(1)
body = embed_assets(body, 'https://vitalityritual.org/assets/')
SUB = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} - The VIRI Edit | Substack</title>
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#fff;color:#1b1b1b;font:400 17px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}}
.bar{{display:flex;align-items:center;justify-content:space-between;max-width:1080px;margin:0 auto;padding:16px 20px}}
.pub{{font:600 17px/1 -apple-system,'Segoe UI',sans-serif}}.btn{{background:#ff6719;color:#fff;border-radius:999px;padding:9px 18px;font:600 14px/1 -apple-system,'Segoe UI',sans-serif}}
.btn.o{{background:none;color:#1b1b1b;border:1px solid #d9d9d9}}
.post{{max-width:728px;margin:0 auto;padding:24px 20px 80px}}
.kick{{font:600 13px/1 -apple-system,'Segoe UI',sans-serif;color:#ff6719;letter-spacing:.02em;margin-bottom:14px}}
h1{{font:700 40px/1.12 -apple-system,'Segoe UI',Helvetica,sans-serif;letter-spacing:-.01em;margin:0 0 10px}}
.sub{{font:400 21px/1.35 Georgia,'Times New Roman',serif;color:#6b6b6b;margin:0 0 22px}}
.by{{display:flex;align-items:center;gap:12px;margin:0 0 22px;font:500 14px/1.3 -apple-system,'Segoe UI',sans-serif}}
.av{{width:40px;height:40px;border-radius:50%;background:#7d6d60;color:#f4efe8;display:grid;place-items:center;font:600 15px/1 -apple-system,sans-serif}}
.by small{{display:block;color:#6b6b6b;font-weight:400;font-size:13px}}
.acts{{display:flex;gap:10px;border-top:1px solid #eee;border-bottom:1px solid #eee;padding:12px 0;margin:0 0 30px;font:500 14px/1 -apple-system,'Segoe UI',sans-serif;color:#555}}
.acts span{{border:1px solid #e3e3e3;border-radius:999px;padding:8px 14px}}
.body{{font:400 20px/1.6 Georgia,'Times New Roman',serif;color:#1b1b1b}}
.body p{{margin:0 0 1.15em}}.body h2{{font:700 30px/1.2 -apple-system,'Segoe UI',Helvetica,sans-serif;margin:1.6em 0 .5em;letter-spacing:-.01em}}
.body h3{{font:700 23px/1.25 -apple-system,'Segoe UI',Helvetica,sans-serif;margin:1.4em 0 .4em}}
.body ul{{margin:0 0 1.15em;padding-left:1.4em}}.body li{{margin:.3em 0}}
.body img{{display:block;max-width:100%;height:auto;margin:0 auto}}.body figure{{margin:1.6em 0}}
.body a{{color:#1b1b1b;text-decoration:underline}}
.body .guide-ph div{{border:1.5px dashed #bbb;color:#888;text-align:center;padding:70px 20px;font:italic 400 20px/1.3 Georgia,serif}}
.foot{{border-top:1px solid #eee;margin-top:40px;padding-top:26px;text-align:center;font:500 15px/1.5 -apple-system,'Segoe UI',sans-serif;color:#555}}
.note{{position:fixed;left:12px;bottom:12px;background:#1b1b1b;color:#fff;font:12px/1.35 -apple-system,'Segoe UI',sans-serif;padding:8px 12px;border-radius:4px;opacity:.88;max-width:340px}}
</style></head><body>
<div class="bar"><span class="pub">The VIRI Edit</span><span><span class="btn o" style="margin-right:8px">Sign in</span><span class="btn">Subscribe</span></span></div>
<div class="post">
<div class="kick">Lifestyle</div>
<h1>{html.escape(title)}</h1>
<p class="sub">{html.escape(desc)}</p>
<div class="by"><span class="av">MC</span><span>Margaret Cole<small>Nov 25, 2026</small></span></div>
<div class="acts"><span>♡ Like</span><span>💬 Comment</span><span>↻ Restack</span><span>Share</span></div>
<div class="body">{body}</div>
<div class="foot">Thanks for reading The VIRI Edit! Subscribe to get new posts every Sunday.<br><br><span class="btn">Subscribe now</span></div>
</div>
<div class="note">Mock-up of the Substack version. It approximates how Substack shows the imported post; Substack’s own styling will differ a little. Nothing is published.</div>
</body></html>'''
open(os.path.join(G, 'mockup-substack.html'), 'w', encoding='utf-8').write(SUB)
print('ok', os.path.getsize(os.path.join(G, 'mockup-website.html')), os.path.getsize(os.path.join(G, 'mockup-substack.html')))
