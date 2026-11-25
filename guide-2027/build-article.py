# Puts the 2027 guide into the website (LOCAL ONLY; nothing is deployed from here).
#   python3 guide-2027/build-article.py
# Reads article-body.html + word-generator.html, copies the images into website/assets, and (re)writes:
#   - the article object 'ultimate-guide-2027' in website/app.js
#   - the WORDGEN + GUIDE_TOC modules in website/app.js  (between the GUIDE-2027 markers)
#   - the guide styles in website/styles.css            (between the GUIDE-2027 markers)
# Safe to re-run: it replaces what it wrote before.
import os, re, shutil
G = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(os.path.dirname(G), 'website')
APP = os.path.join(W, 'app.js'); CSS = os.path.join(W, 'styles.css'); IDX = os.path.join(W, 'index.html')
rd = lambda p: open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)

# ---- 1. images ----
COVER = os.environ.get('GUIDE_COVER') or (os.path.join(G, 'cover-photo.jpg') if os.path.exists(os.path.join(G, 'cover-photo.jpg')) else None)  # her cover photo
IMGS = {'toc.png': 'guide-2027-toc.png', 'step1-pick-a-card.png': 'guide-2027-step1-pick-a-card.png', 'step2-life-areas.png': 'guide-2027-step2-life-areas.png',
        'step3-bad-week.png': 'guide-2027-step3-bad-week.png', 'step4-board-layout.png': 'guide-2027-step4-board-layout.png',
        'step5-habit-stack.png': 'guide-2027-step5-habit-stack.png', 'step6-year.png': 'guide-2027-step6-year.png',
        'step8-my-2027-printable.png': 'guide-2027-my-2027-printable.png', 'conclusion-first-week.png': 'guide-2027-first-week.png',
        'january-2027-calendar.png': 'guide-2027-january-calendar.png', 
        'step7-not-doing.png': 'guide-2027-step7-not-doing.png', 'wordgen-compact.png': 'guide-2027-word-generator.png', 'cover-portrait.png': 'guide-2027-cover.png', 'cover-lead.png': 'guide-2027-lead.png'}
for a, b in IMGS.items():
    shutil.copyfile(os.path.join(G, a), os.path.join(W, 'assets', b))
for a, b in {'pins-1.png': 'guide-2027-pins-1.png', 'pins-2.jpg': 'guide-2027-pins-2.jpg', 'pins-3.jpg': 'guide-2027-pins-3.jpg'}.items():  # her board screenshots, from her Google Doc
    shutil.copyfile(os.path.join(G, 'doc-images', a), os.path.join(W, 'assets', b))
COVER_IMG, LEAD_IMG = 'guide-2027-cover.png', 'guide-2027-lead.png'
if COVER:
    ext = os.path.splitext(COVER)[1].lower()
    shutil.copyfile(COVER, os.path.join(W, 'assets', 'guide-2027-cover-photo' + ext))
    COVER_IMG = LEAD_IMG = 'guide-2027-cover-photo' + ext

# ---- 2. the article object ----
body = rd(os.path.join(G, 'article-body.html')).strip()
assert '`' not in body
title = 'The Ultimate Guide to Making 2027 Your Best Year Yet'
obj = ("  {id:'ultimate-guide-2027',pull:'Set goals for your worst week, not your best one.',category:'Lifestyle',title:'%s',"
       "titleLines:['The Ultimate Guide','to Making 2027','Your Best Year Yet'],img:'%s',leadImg:'%s',author:'Margaret Cole',date:'2026-11-25',"
       "desc:'The nine steps you need to start your 2027 off right.',"
       "body:`%s`},\n") % (title, COVER_IMG, LEAD_IMG, body)
app = rd(APP)
app = re.sub(r"  \{id:'ultimate-guide-2027'.*?`\},\n", '', app, flags=re.S)
lines = app.split('\n')
i = next(k for k, l in enumerate(lines) if l.lstrip().startswith("{id:'pick-a-card'"))
lines.insert(i + 1, obj.rstrip('\n'))
app = '\n'.join(lines)

# ---- 3. modules ----
wg = rd(os.path.join(G, 'word-generator.html'))
js = wg[wg.index('/* ---------- the word bank'):wg.index('WORDGEN.mount(document.getElementById')]
# everything the generator declares lives inside its own function, so nothing leaks into app.js
head, rest = js.split('const WORDGEN=(()=>{', 1)
js_mod = 'const WORDGEN=(()=>{\n' + head + rest
js_mod = js_mod.replace('<h1>Find your <em>2027 word</em></h1>', '<p class="wg-h">Find your <em>2027 word</em></p>')
js_mod = js_mod.replace('<h2>Words you’ve kept</h2>', '<p class="wg-k">Words you’ve kept</p>')
js_mod = re.sub(r"\n  // \?demo=.*?\n  }\n", "\n", js_mod, flags=re.S)
js_mod = js_mod.replace("['#7d6d60','#f4efe8']", "['#63554a','#f4efe8']")  # darker taupe so the small meaning text passes contrast
assert 'demo' not in js_mod, 'demo block not stripped'
TOC_JS = r'''
const GUIDE_TOC=(()=>{
const ITEMS=[['Look back before you leap forward','Reflect on what 2026 actually was'],['Choose your themes and your word','Three themes, one word'],['Goal setting that survives a bad week','One or two goals per theme'],['Build your 2027 vision board','Pinterest first, then a real board'],['Habits and systems','Triggers, trackers and a weekly reset'],['Your 2027 calendar','Milestones, start dates and rest'],['The “not doing” list','Three to five things to let go of'],['My 2027, as an example','The whole process, with a real plan'],['Start this week','Four small things before the week is out']];
function mount(root){
  root.innerHTML=`<p class="gt-s">inside</p><p class="gt-h">Your 2027 guide, in <em>nine steps</em></p><ol>${ITEMS.map((it,i)=>`<li><a href="#step-${i+1}" data-step="step-${i+1}"><span class="gt-n">${i+1}</span><span class="gt-t">${it[0]}</span></a></li>`).join('')}</ol><p class="gt-f">Do them in order or skip around</p>`;
  root.addEventListener('click',e=>{const a=e.target.closest('a[data-step]');if(!a)return;e.preventDefault();const t=document.getElementById(a.dataset.step);if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});});
}
return{mount};
})();
'''
MOD = '/* GUIDE-2027:start (written by guide-2027/build-article.py) */\n/* ===================== 2027 guide: word generator + table of contents =====================\n   Mounted into #wordgen-tool and #guide-toc on the ultimate-guide-2027 article. The article body already holds a\n   plain picture of each (that is what Substack imports); this replaces them. Kept words stay in this browser. */\n' + js_mod + TOC_JS + '/* GUIDE-2027:end */\n'
app = re.sub(r'/\* GUIDE-2027:start.*?GUIDE-2027:end \*/\n', '', app, flags=re.S)
mark = '/* ===================== Pick a Card (December reflection)'
assert mark in app
app = app.replace(mark, MOD + mark, 1)
hook = "if($('#pick-tool'))PICK.mount($('#pick-tool'));"
assert hook in app
app = app.replace("if($('#wordgen-tool'))WORDGEN.mount($('#wordgen-tool'));if($('#guide-toc'))GUIDE_TOC.mount($('#guide-toc'));", '')
app = app.replace(hook, hook + "if($('#wordgen-tool'))WORDGEN.mount($('#wordgen-tool'));if($('#guide-toc'))GUIDE_TOC.mount($('#guide-toc'));", 1)
if "'ultimate-guide-2027'" not in re.search(r'const PIN_CREDIT=new Set\(\[.*?\]\)', app).group(0):
    app = app.replace("const PIN_CREDIT=new Set(['", "const PIN_CREDIT=new Set(['ultimate-guide-2027','", 1)
wr(APP, app)

# ---- 4. styles ----
rules = [l for l in wg.split('\n') if l.startswith('.wg ') or l.startswith('.wg{')]
out = []
for l in rules:
    l = l.replace('.wg h1', '.wg .wg-h').replace('.wg .kept h2', '.wg .kept .wg-k').replace('.wg .kept p', '.wg .kept p')
    for a, b in [('var(--chip-on-ink)', 'var(--wg-chip-on-ink)'), ('var(--chip-on)', 'var(--wg-chip-on)'), ('var(--chip)', 'var(--wg-chip)'), ('var(--accent-ink)', 'var(--on-dark)'), ('var(--accent)', 'var(--wg-accent)'), ('var(--script)', 'var(--wg-script)')]:
        l = l.replace(a, b)
    out.append('.article-prose ' + l)
css_wg = '\n'.join(out)
css_extra = '''
.article-prose .wg{--wg-chip:var(--paper);--wg-chip-on:var(--ink);--wg-chip-on-ink:var(--on-dark);--wg-accent:#8C3B2E;--wg-script:'Mea Culpa','Italianno',cursive;max-width:none;margin:30px 0 36px;padding:clamp(22px,4vw,38px);background:var(--paper);border:1px solid var(--line);color:var(--ink)}
.article-prose .wg>figure,.article-prose .wg>p{margin-left:0;margin-right:0}
.article-prose .wg .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.article-prose .wg .kept .wg-k{display:block;font-family:var(--display);font-weight:400;font-size:26px;margin:0 0 6px}
.article-prose .wg p{margin-bottom:0}
.article-prose .wg .wg-h{font-size:clamp(30px,5vw,40px);line-height:1.08;margin:0 0 12px}
.article-prose .wg .script{font-size:clamp(30px,5vw,40px)}
.article-prose .wg ul{padding-left:0}
.article-prose .wg li{margin:0}
.article-prose .gtoc{margin:26px 0 34px;background:var(--paper);border:1px solid var(--line);padding:clamp(18px,3.4vw,30px) clamp(16px,4vw,38px) clamp(14px,2.4vw,20px)}
.article-prose .gtoc figure{margin:0}
.article-prose .gtoc .gt-s{font:400 clamp(28px,4.6vw,38px)/1 'Mea Culpa','Italianno',cursive;color:var(--taupe);margin:0}
.article-prose .gtoc .gt-h{font:400 clamp(22px,3.4vw,29px)/1.1 var(--display);letter-spacing:-.01em;margin:4px 0 clamp(12px,2vw,18px)}
.article-prose .gtoc .gt-h em{font-style:italic}
.article-prose .gtoc ol{list-style:none;margin:0;padding:0}
.article-prose .gtoc li{margin:0;border-top:1px solid var(--line)}
.article-prose .gtoc a{display:grid;grid-template-columns:clamp(34px,6vw,52px) 1fr;align-items:center;padding:clamp(10px,1.6vw,13px) 0;color:inherit;text-decoration:none;border-bottom:0}
.article-prose .gtoc .gt-n{font:italic 400 clamp(26px,4.4vw,36px)/1 var(--display);color:var(--taupe)}
.article-prose .gtoc .gt-t{display:block;font:400 clamp(16px,2.2vw,20px)/1.15 var(--display)}
.article-prose .gtoc .gt-u{display:block;font:300 clamp(12.5px,1.5vw,14px)/1.35 var(--body);color:var(--muted);margin-top:2px}
.article-prose .gtoc a:hover .gt-t,.article-prose .gtoc a:focus-visible .gt-t{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}
.article-prose .gtoc .gt-f{border-top:1px solid var(--line);margin:0;padding-top:14px;font:500 11px/1 var(--body);letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
.article-prose h2[id]{scroll-margin-top:96px}
.article-prose .pins{display:flex;flex-direction:column;gap:10px;margin:18px 0 26px}
.article-prose .pins figure{margin:0}
.article-prose .guide-ph{margin:22px 0}
.article-prose .guide-ph div{border:1.5px dashed var(--taupe-light);background:var(--paper);color:var(--muted);text-align:center;padding:clamp(40px,10vw,90px) 20px;font:italic 400 clamp(18px,3vw,24px)/1.3 var(--display)}
.article-prose figure img{display:block;width:100%;height:auto}
.article-prose figure.wide figcaption{margin-top:8px;font:500 11px/1 var(--body);letter-spacing:.18em;text-transform:uppercase;color:var(--muted);text-align:center}
.article-prose figure.wide a{border-bottom:0;display:block}
.article-prose .wg .chip{text-transform:none;letter-spacing:.02em}
.article-prose .wg{padding:clamp(14px,2.6vw,22px) clamp(14px,3vw,26px)}
.article-prose .wg .script{font-size:clamp(24px,4vw,30px)}
.article-prose .wg .wg-h{font-size:clamp(24px,4vw,30px);margin:0 0 6px}
.article-prose .wg .lede{font-size:14px;line-height:1.45;margin:0 0 10px;max-width:none}
.article-prose .wg fieldset{padding:10px 0 2px}
.article-prose .wg legend{font-size:clamp(16px,2.6vw,19px);margin:0 0 2px}
.article-prose .wg legend small{display:inline;margin:0 0 0 8px;font-size:12px}
.article-prose .wg .chips{gap:6px;padding-top:6px}
.article-prose .wg .chip{font-size:13px;padding:7px 12px;min-height:34px}
.article-prose .wg .go{margin:12px 0 2px;padding-top:12px;gap:12px}
.article-prose .wg .btn{font-size:11px;padding:11px 16px;min-height:38px}
.article-prose .wg .result{margin-top:16px}
.article-prose .wg .wcard{padding:clamp(22px,5vw,34px) 18px clamp(18px,4vw,26px)}
.article-prose .wg .wcard .w{font-size:clamp(44px,11vw,72px);margin:6px 0 8px}
.article-prose .wg .wcard .m{font-size:15px}
.article-prose .wg .wcard .v{margin-top:16px;font-size:11px}
.article-prose .wg .acts{margin-top:12px;gap:8px}
.article-prose .wg .check{margin-top:10px;font-size:13px}
.article-prose .wg .fine{margin-top:12px;font-size:12px}

'''
css = rd(CSS)
css = re.sub(r'/\* GUIDE-2027:start.*?GUIDE-2027:end \*/\n', '', css, flags=re.S)
css = css.rstrip('\n') + '\n/* GUIDE-2027:start (written by guide-2027/build-article.py) */\n' + css_wg + '\n' + css_extra + '/* GUIDE-2027:end */\n'
wr(CSS, css)

# ---- 5. Mea Culpa for the word card (the site's font link does not load it yet) ----
idx = rd(IDX)
if 'family=Mea+Culpa' not in idx:
    idx = idx.replace('family=Jost:wght@300;400;500&display=swap', 'family=Jost:wght@300;400;500&family=Mea+Culpa&display=swap', 1)
    wr(IDX, idx)
print('ok: article + modules + styles written; images copied')
