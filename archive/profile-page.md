# Archived: the profile page — RESTORED 2 October 2026

> Back on the live site. The five-step sign-up now ends on it, and every
> redirect in the table below has been pointed back. Kept for the record of
> what was removed and why.

Removed from `project/dist-elevated/app.js` on 29 September 2026. The profile
page was a mock — it rendered a sample circle whether or not anyone had signed
up — and the header's profile icon led straight to it. The icon now goes to
`#/signup` instead, and this page comes back as the thing you land on *after*
logging in, once the sign-up and login pages are finished.

## What was removed

Only two things: the `profilePage()` function below, and its `case 'profile'`
arm in the router. `#/profile` now redirects to `#/signup`, so old links and
bookmarks land somewhere sensible rather than on the 404 page.

## What was deliberately LEFT IN, so restoring is just the function + the route

- `eventCard()` — `profilePage()` was its only remaining caller after the clubs
  archive, so it is dead code right now. Left in place because this page and
  `archive/clubs-and-activities.md` both need it back.
- `postActivity()` and the `edit-profile`, `post-activity` and `connect-sample`
  action handlers — unreachable without this page, harmless, ready.
- `initials()`, and every `.profile-grid` / `.profile-panel` / `.feed-card` /
  `.upcoming-row` / `.contact-card` rule in `styles.css`.
- `state.profile`, `state.posts`, `state.connections`, `state.joined`,
  `state.saved` in the saved state shape — nobody's demo data is destroyed, it
  just has nowhere to render until this returns.

## Redirects that were pointed elsewhere and need pointing back

These all used to end on the profile. They are temporary landings, not design
decisions — put them back to `#/profile` when this page returns.

| Where | Was | Now |
|---|---|---|
| `bindAuth()` on successful login | `#/profile` | `#/` |
| `bindSetup()` after saving the profile | `#/profile` | `#/` |
| booking confirm (`bookPage` flow) | `#/profile` | `#/explore` |
| setup page "Skip for now" link | `#/profile` | `#/` |
| footer "Your next ritual" column | `Your profile` | `Log in` |
| `authPage()` "Explore the sample profile" | `#/profile` | link removed |
| header profile icon | `#/profile` | `#/signup` |
| menu panel "Your circle" group | `Your profile` | link removed |

## The function

```js
function profilePage(){const p=state.profile;const name=p?.name||'Your name';const joined=allEvents().filter(e=>state.joined.includes(e.id));const saved=studios.filter(s=>state.saved.includes(s.id));return `<section class="page-head"><div class="wrap"><div class="page-head-row"><div><p class="eyebrow">Your corner of the city</p><h1>Your circle.</h1></div><div style="display:flex;gap:12px">${p?'<button class="button outline small" data-action="edit-profile">Edit profile</button>':button('Build your profile','#/signup','small')}<button class="button small" data-action="post-activity">Post an activity</button></div></div></div></section><div class="wrap">${note('This profile, feed, suggested people, and rewards demonstrate the experience. Your changes stay on this device.')}<div class="profile-grid"><aside class="profile-panel"><div class="profile-avatar">${p?escapeHTML(initials(p.name)):'ViRi'}</div><h2>${escapeHTML(name)}</h2><p class="location">${escapeHTML(p?.area||'Washington, DC')}</p><div class="profile-stats"><div><span>Friends</span><strong>${state.connections.length}</strong></div><div><span>Requests sent</span><strong>${(state.requests||[]).length}</strong></div><div><span>Studios</span><strong>${saved.length}</strong></div><div><span>Activities</span><strong>${state.posts.length}</strong></div></div><div class="interests">${(p?.interests||['Pilates','Yoga','Running']).map(c=>`<span>${escapeHTML(c)}</span>`).join('')}</div><h3>Upcoming activities</h3>${joined.length?joined.map(e=>`<div class="upcoming-row"><span class="small">${prettyDate(e.date)} · ${prettyTime(e.date)}</span><strong>${escapeHTML(e.title)}</strong><button class="plain-link small" data-action="event-details" data-id="${e.id}">View plan</button></div>`).join(''):'<p class="small">Your next ritual starts with a plan. Join an activity to see it here.</p>'}<a class="text-link" href="#/explore" style="margin-top:20px">Find an activity ${arrow}</a><h3>Saved studios</h3>${saved.length?saved.map(s=>`<a class="upcoming-row" style="display:block" href="#/studios/${s.id}">${s.name} ${arrow}</a>`).join(''):'<p class="small">Keep your favorite studios close. Save one while you explore.</p>'}<h3>Your ritual rewards</h3><p>${state.posts.length*100} points</p><p class="small">Demo points for showing up. Reward redemptions are not available in this preview.</p></aside><section class="profile-content"><h2>Feed</h2>${state.posts.slice().reverse().map(post=>`<article class="feed-card"><div class="feed-author"><span class="mini-avatar">${escapeHTML(initials(p?.name||'You'))}</span><div>${escapeHTML(p?.name||'You')}<p class="small">Your activity · ${prettyDate(post.date)}</p></div></div><h3>${escapeHTML(post.title)} · ${post.duration} min</h3><p>${escapeHTML(post.description)}</p><p class="small" style="margin-top:15px">+100 ritual points · Preview</p></article>`).join('')}<article class="feed-card"><div class="feed-author"><span class="mini-avatar">JC</span><div>Jamie’s circle<p class="small">Sample member · Example activity</p></div></div><h3>CycleBar · 45 min</h3><p>A morning ride and a new reason to get out the door. Who’s joining next time?</p><img src="${A}brand-cyclebar.webp" alt="Riders in a CycleBar class"><a class="text-link" href="#/explore">Find a ride ${arrow}</a></article><article class="feed-card"><p class="eyebrow">Your next connection</p><h3>The best part might be after class.</h3><p style="margin-top:15px">Invite someone to stay for a coffee. A shared routine starts with one small plan.</p></article></section><aside class="profile-aside"><h2>Suggested</h2>${eventCard(seedEvents[0])}<div class="contact-card" style="padding:25px;margin-top:25px"><div class="profile-avatar">AL</div><h3>Alex’s circle</h3><p class="small">Sample member · Georgetown</p><p>Early morning movement, easy runs, and coffee after class.</p><div class="interests" style="margin:20px 0"><span>Running</span><span>Yoga</span></div><button class="button small outline" data-action="connect-sample" aria-pressed="${state.connections.includes('alex')}">${state.connections.includes('alex')?'Connected ✓':'Connect'}</button></div></aside></div></div>`;}
```
