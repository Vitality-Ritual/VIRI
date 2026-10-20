# encoding: utf-8
# Builds substack/copy-kit.html from the articles in website/app.js: one card per
# article, oldest first, with Copy buttons for the title, subtitle and the article
# itself (rich text, so headings, italics, lists and photos survive a paste into
# Substack's editor). Re-run after adding an article:  ruby substack/make-copy-kit.rb
require 'cgi'
ROOT = File.expand_path('..', __dir__)
SITE = 'https://vitalityritual.org/assets/'
NOTES = {
  'september-reset' => 'Cover photo: replace or identify first (source unknown).',
  'fall-things-to-do' => 'Cover photo: replace first (saved from a social media post).',
  'office-dressing' => 'Annabel Green’s article: ask her before reposting.',
  'corporate-burnout' => 'Cover photo: check its source first.',
  'run-essentials' => 'Cover photo: check its source first.',
  'saving-money' => 'Cover photo: check its source first.',
  'busy-personality-trait' => 'Cover photo: check its source first.'
}
src = File.read(File.join(ROOT, 'website/app.js'), encoding: 'utf-8')
list = src[/const articles=\[(.*?)\n\];/m, 1] or abort 'articles not found'
arts = list.split(/\n\s*(?=\{id:')/).map { |chunk|
  f = ->(k) { chunk[/#{k}:'((?:[^'\\]|\\.)*)'/, 1].to_s.gsub("\\'", "'") }
  next unless chunk.start_with?('{id:') || chunk.strip.start_with?('{id:')
  { id: f.('id'), category: f.('category'), title: f.('title'), img: f.('img'), author: f.('author'),
    date: f.('date'), desc: f.('desc'), pull: f.('pull'),
    body: chunk[/body:`(.*?)`\}/m, 1].to_s.gsub('${A}', SITE) }
}.compact.sort_by { |a| a[:date] }

h = ->(s) { CGI.escapeHTML(s) }
cards = arts.each_with_index.map { |a, i|
  date = Time.new(*a[:date].split('-').map(&:to_i)).strftime('%B %-d, %Y')
  note = NOTES[a[:id]] ? %(<p class="note">#{h.(NOTES[a[:id]])}</p>) : ''
  body = %(<p><img src="#{SITE}#{a[:img]}" alt=""></p>) + a[:body] +
         %(<p><em>This story first appeared on <a href="https://vitalityritual.org/#/read/#{a[:id]}">vitalityritual.org</a>.</em></p>)
  <<~CARD
    <section class="card">
      <img class="cover" src="#{SITE}#{a[:img]}" alt="">
      <div class="meta">
        <p class="eyebrow">#{i + 1} of #{arts.size} · #{h.(a[:category])} · #{date} · #{h.(a[:author])}</p>
        <h2>#{h.(a[:title])}</h2>
        <p class="sub">#{h.(a[:desc])}</p>
        #{note}
        <div class="buttons">
          <button data-copy="t#{i}">Copy title</button>
          <button data-copy="s#{i}">Copy subtitle</button>
          <button data-copy="b#{i}" class="main">Copy article</button>
          <a href="#{SITE}#{a[:img]}" download>Cover photo</a>
        </div>
        <p class="tag">Tag on Substack: <b>#{h.(a[:category])}</b> · Publish on the web only (no email)</p>
      </div>
      <div class="src" id="t#{i}">#{h.(a[:title])}</div>
      <div class="src" id="s#{i}">#{h.(a[:desc])}</div>
      <div class="src rich" id="b#{i}">#{body}</div>
    </section>
  CARD
}.join

html = <<~HTML
  <!doctype html>
  <html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VIRI Substack copy kit</title>
  <style>
    :root{--paper:#fbf9f5;--cream:#e9e4dc;--taupe:#7d6d60;--cocoa:#5a4433;--ink:#3b322a;--line:#d6cec2;--muted:#665a4e}
    body{margin:0;background:var(--cream);color:var(--ink);font:16px/1.6 Georgia,serif}
    header{max-width:820px;margin:0 auto;padding:40px 20px 10px}
    header h1{font-weight:400;color:var(--cocoa);letter-spacing:.06em;margin:0 0 6px}
    header p{margin:0 0 8px;color:var(--muted)}
    .card{max-width:820px;margin:18px auto;background:var(--paper);border:1px solid var(--line);display:grid;grid-template-columns:180px 1fr;gap:20px;padding:20px}
    .cover{width:180px;height:220px;object-fit:cover}
    .eyebrow{font:12px/1.4 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0}
    h2{font-weight:400;color:var(--cocoa);margin:6px 0;font-size:24px;line-height:1.2}
    .sub{margin:0 0 8px;color:var(--muted)}
    .note{background:#f6e9e4;border-left:3px solid #8C3B2E;padding:6px 10px;margin:8px 0;font:14px/1.5 Arial,sans-serif}
    .buttons{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 6px}
    button,.buttons a{font:13px Arial,sans-serif;letter-spacing:.06em;padding:9px 14px;border-radius:999px;border:1px solid var(--taupe);background:#fff;color:var(--cocoa);cursor:pointer;text-decoration:none}
    button.main{background:var(--taupe);color:#fff}
    button.done{background:#3d6b4f;border-color:#3d6b4f;color:#fff}
    .tag{font:13px Arial,sans-serif;color:var(--muted);margin:4px 0 0}
    .src{position:absolute;left:-99999px;top:0;width:600px}
    @media (max-width:600px){.card{grid-template-columns:1fr}.cover{width:100%;height:200px}}
  </style></head><body>
  <header>
    <h1>VIRI Substack copy kit</h1>
    <p>#{arts.size} articles, oldest first. For each one: start a new post in Substack, then copy the title, subtitle and article into it. The cover photo is already at the top of the article; also set it as the post's social image.</p>
    <p>Rebuilt from the website on #{Time.now.strftime('%B %-d, %Y')}.</p>
  </header>
  #{cards}
  <script>
    document.addEventListener('click', e => {
      const b = e.target.closest('button[data-copy]'); if (!b) return;
      const el = document.getElementById(b.dataset.copy);
      const r = document.createRange(); r.selectNodeContents(el);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      const ok = document.execCommand('copy'); sel.removeAllRanges();
      const was = b.textContent; b.textContent = ok ? 'Copied' : 'Copy failed'; b.classList.add('done');
      setTimeout(() => { b.textContent = was; b.classList.remove('done'); }, 1600);
    });
  </script>
  </body></html>
HTML
File.write(File.join(__dir__, 'copy-kit.html'), html)
puts "copy-kit.html: #{arts.size} articles (#{arts.map { |a| a[:id] }.join(', ')})"
