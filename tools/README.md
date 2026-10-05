# tools

Small scripts that stop VIRI's recurring mistakes from reaching the live site.
They need nothing beyond what macOS ships: no Node, no Xcode command line tools.

## Before every deploy

```
cd ~/Desktop/ViRi/project
ruby tools/check.rb --stamp
```

`--stamp` re-stamps `?v=` on the asset URLs in `index.html` so browsers fetch the
new files; leave it off to check without touching anything. Deploy only on
`PASS`. Then open the site, hard-refresh (Cmd+Shift+R), and paste
`tools/sweep.js` into the browser console.

| check | what it catches | how it happened before |
| --- | --- | --- |
| syntax | a file that will not parse | scripted edits left the site blank |
| functions | any top-level function or const that is live but missing locally | a `.*?` regex deleted eight functions, About, Studios and Contact among them |
| writes | an update or delete in `db.js` not going through `written()` | row-level security made accept-request, mark-read and save-profile silently do nothing |
| handlers | a button wired to a function that does not exist | the "Show my age" switch called `toggleShowAge`, never written, so it threw and did nothing |
| account gate | an account-only button (add to my week, save, message, goals, passes) that a signed-out visitor could open, or a stale name in the list | "Add to my week" opened the signed-in form for visitors with no account |
| roster | anything but `personById()` touching the sample roster | real members saw empty lists because code looked only at `VIRI.people` |
| venues | duplicate ids, wrong category, a venue far from its city | a geocoder put a Manhattan gym in Queens |
| cache | changed files deployed without a new `?v=` | changes that shipped looked like they had not |

## Making an edit with a script

Prefer an editor. If it has to be a script, use `swap.rb`, which replaces exact
text only and refuses unless the count matches:

```
ruby tools/swap.rb dist-elevated/app.js old.txt new.txt
```

## The rule behind `written()`

Postgres row-level security does not refuse an UPDATE or DELETE that no policy
permits. It filters the row out, nothing matches, and Supabase answers with
success. So every update and delete in `db.js` is wrapped:

```js
const { error } = await written(c.from('goals').delete().eq('id', id), 'That goal could not be removed.');
```

`written()` asks for the rows back and treats none as an error. Inserts do not
need it: a refused insert does raise an error. Writes belong in `db.js`, never in
`app.js`; `check.rb` fails either way.

For this to work, the owner must be able to SELECT the row being written. A new
table needs a select policy for its owner, or every write to it will report
failure even when it succeeded.
