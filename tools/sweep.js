/* VIRI route sweep. Renders every page the router knows and reports any that
   throw or come back empty.

   Use: open the site (local or live), hard-refresh with Cmd+Shift+R so you are
   testing the new files, open the console (Cmd+Option+J), paste all of this,
   press Return. Run it once signed out and once signed in; several pages only
   show their real content to a member.

   Why it exists: scripted edits to app.js have twice deleted whole pages, once
   eight functions including About, Studios and Contact, and nothing noticed
   until someone clicked. tools/check.rb catches a missing function; this
   catches a page that is present but broken.

   The route list is read out of render() itself, so a new page is swept
   without anyone remembering to add it here. */
(() => {
  if (typeof render !== 'function') { console.error('sweep: render() not found. Is this the VIRI site?'); return; }
  const src = render.toString();
  const routes = [...new Set([...src.matchAll(/case '([^']*)':/g)].map(m => m[1]))];
  /* pages that take an id are swept with a real one where there is one.
     studios, articles and state are top-level const/let in app.js: reachable
     by name from the console, but not as properties of window. */
  const sample = {
    studios: typeof studios !== 'undefined' ? studios[0]?.id : undefined,
    read: typeof articles !== 'undefined' ? articles[0]?.id : undefined,
    member: typeof state !== 'undefined' ? Object.keys(state.people || {})[0] : undefined,
  };
  const here = location.hash;
  const rows = [];
  for (const r of routes) {
    const ids = [undefined, sample[r]].filter((v, i) => i === 0 || v);
    for (const id of ids) {
      const hash = '#/' + r + (id ? '/' + id : '');
      history.replaceState(null, '', hash);
      const t = performance.now();
      let error = '';
      try { render(false); } catch (e) { error = String(e && e.message || e); }
      const main = document.getElementById('main');
      const size = main ? main.innerHTML.length : 0;
      rows.push({ page: hash, ms: Math.round(performance.now() - t), size,
                  result: error ? 'THREW: ' + error : size < 150 ? 'EMPTY' : 'ok' });
    }
  }
  history.replaceState(null, '', here || '#/');
  try { render(false); } catch (e) {}
  const bad = rows.filter(r => r.result !== 'ok');
  console.table(rows);
  if (bad.length) console.error(`sweep: ${bad.length} of ${rows.length} pages failed`, bad);
  else console.log(`sweep: all ${rows.length} pages rendered`);
  return bad.length ? bad : `all ${rows.length} pages rendered`;
})();
