# ViRi — elevated variant (dist-elevated)

Built from `dist-marais` and redesigned to your template: greige ground, taupe panels, a
high-contrast serif with a script accent. Your photographs throughout. The earlier folders
(`dist/`, `dist-marais/`, `dist-airy/`, `dist-sante/`, `dist-sunday/`) are untouched.

    python3 -m http.server 8000 --directory dist-elevated

## The wordmark

On load the header reads **Vitality Ritual**. After a beat every letter except the V, the first
i, the R and its i collapses to zero width and fades, the space between the words closes, and the
four survivors slide together into **ViRi**. It runs once per page load, not on every navigation,
and under `prefers-reduced-motion` the header simply starts as ViRi.

The other motion: the headline words rise in sequence, the cover photograph drifts slowly in and
out, the inset card fades up over the hero edge, the feature photographs ease back from a slight
zoom as they scroll into view, and cards lift on hover. Nothing loops in your face.

## The system

| Token | Value | Use |
| --- | --- | --- |
| `--cream` / `--cream-2` | `#e9e4dc` / `#f1ede6` | page, lighter band |
| `--paper` | `#fbf9f5` | cards, dialog |
| `--taupe` / `--taupe-deep` | `#7d6d60` / `#63554a` | panels, buttons, footer |
| `--taupe-light` | `#bfb1a3` | decorative fills only, never behind text |
| `--cocoa` | `#5a4433` | display headings |
| `--muted` | `#665a4e` | body copy (4.9:1 on cream) |

Your template's panel taupe is lighter than this. I darkened the text-bearing taupe so white type
on it passes contrast — the lighter tone is still there as `--taupe-light` for decorative blocks.

Type is **Bodoni Moda** (display, high contrast, set in caps like your reference), **Parisienne**
(the script accent, used for *your* in the headline and the founder signatures) and **Jost**
(body and every small label), all from Google Fonts.

## Your photographs

| Where | Photograph |
| --- | --- |
| Cover | the two women in the arched studio |
| Cover inset | the ankle-weight detail |
| Connect panel | the two women on reformers |
| Longevity | the two women with coffees at the table |
| About hero | the mat class |
| Sign-up | walking into the studio |
| The ViRi edit | lockers (wardrobe), running, studio entry |

The cover is your wood-floor coffee photograph, clean, with **SOCIALIZE *your* FITNESS** set live
over it so the type scales properly on a phone. The inset card below it is your pilates photograph
at its own aspect ratio, so nothing is cropped, and it is centred by margin rather than by a
transform — the entrance animation used to knock it off-centre.

## Two things to check on your screen

**Fonts.** My test environment cannot reach Google Fonts, so every screenshot I take renders
fallback faces rather than the real ones. On your machine and on the published link they load
normally. The wordmark is **Cormorant Garamond** in caps, matched by eye to the VIRI you sent —
if it is not quite right, it is one line: `--mark` in `styles.css`. Headings stay Bodoni Moda, the
script accent is Parisienne, body is Jost. Quotes moved out of the display serif into Jost, which
is the readability fix you asked for.

**The hero crop.** `object-position: center 32%` on `.cover-image` sets how the photograph sits
behind the headline; nudge that percentage if the type lands awkwardly over the figures.

## Preserved

All 24 routes, hash routing, localStorage prototype state, signup/login, join/leave, saved
studios, activity and club creation, feed posting, filters, search, map/list, carousel wrapping,
scroll reveals, reduced-motion and print fallbacks, focus rings, and every preview disclaimer.

## Checked

All 24 routes at 1440 / 768 / 390px: no console errors from the app, no horizontal overflow.
Interactions re-tested end to end. The wordmark morph verified to end on exactly "ViRi". Body copy
sits at 4.9:1 on the cream ground.

Not checked: Google Fonts and the OpenStreetMap embed, neither of which loads in my sandbox.

## Rights

The lifestyle photographs you supplied are third-party images, as is the studio photography that
came with the original build. Fine for a private design review; both need clearing before this
goes anywhere public.

## This round (photo direction + the seal)

**Photography.** The five pictures from your Pinterest folder are in, and the images that were
fighting them are out. Cover is your café-table frame; the inset below it is the brown-legging
detail; ritual steps 02 and 03 are the pilates balls and the overhead rug; Longevity is the
plaster-wall stretch. The three generated `ritual-*.webp` squares, the burgundy `community-women.jpg`
and the old cover pair are no longer referenced — still on disk if you want them back.

Connect now moves through time rather than sitting still: empty studio, kit laid out, three women
together. Frame three is `community-three.png`, not the café table, so the cover photograph isn't
used twice on one page. About's hero is the wide studio frame, resized from 5512px to 2600px —
7.3MB was slowing the page down for no visible gain.

**The studio cards are typographic.** Every brand press photo is gone from the grid. Each studio is
now its name set in Bodoni Moda on a taupe plate over its category. Coherent, and it sidesteps the
logo-licensing question entirely.

**The cover is a plate on a field.** The trail photograph runs the full height of the cover at its
own 736:920 proportions, centred, with the greige ground either side. The left margin carries
VITALITY RITUAL set vertically in small caps; the right carries the No. 02 seal above a hairline and
EST. 2026. Nothing else — no eyebrow, no lede, no inset.

The plate is `calc(var(--cover-h) * 0.8)` wide, which at the 820px height cap is 656px from a
1472px file: roughly 2.3x oversampled, so it stays crisp on a retina screen. Crop is
`object-position: center 46%` on `.cover-image`.

Title contrast measured against the brightest tenth of the photograph behind each line:
Socialize 6.2:1, your 5.8:1, Fitness 7.6:1 — all above the 4.5:1 threshold before the text-shadow
is counted. If you change the crop, re-check that; the sand path is the bright spot to watch.

**Cover typography.** Cormorant Garamond light, stacked on three lines, with *your* in the same
family's italic at 0.78em. No script, no arch. Adjust in `.cover-title` in `styles.css`.

**Monogram No. 02, the Seal.** Stamped on the cover photograph (its intended use), signed at the
foot of every page, and reduced to circle-plus-VR for the favicon. The header keeps the
Vitality Ritual → ViRi morph — the seal's ring type is illegible below about 60px, so it earns its
place on photography rather than in the masthead.

**Connect scrolling.** Three fixes. The scroll handler was re-measuring the section's geometry on
every frame, forcing a layout recalculation mid-scroll — that is now cached and re-read only on
resize. The frames cross-faded through the background; they now stack, so each one fades in over the
last and nothing flashes. And the step descriptions animated `max-height`, which is a layout
animation; they animate on grid rows instead. There is also a small dead zone at each boundary so a
one-pixel scroll can't flip the frame back and forth.

**The longevity statistic** is paired with the two women talking over coffee rather than the solo
stretch. The claim is about social ties; the photograph should have more than one person in it.

## This round

**Connect scrolls one step per gesture.** The pinned section was 250vh, which meant about 510px of
scrolling per step — two gestures. It is now `min(100svh - header, 640px) + 700px`, so the travel is
a fixed 700px whatever the screen, or 207px per step. One scroll, one step.

**The statistic band no longer crops.** `.feature-media` had a fixed height while the copy beside it
set its own, so the photograph was cropped to a shape that had nothing to do with the row. The media
is now `position:relative` with the image absolutely filling it, so it stretches to exactly the
copy's height — measured at 494px and 494px.

**Studio tiles reveal a photograph on hover** instead of just darkening, and the photograph now shows
the thing the studio actually does — bikes for CycleBar and SoulCycle, a reformer floor for
[solidcore] and Club Pilates, a barre room for Pure Barre, mats for CorePower, treadmills for
Orangetheory and Barry's. Accuracy beat palette here: the two cycling photographs and the Barry's
floor are dark, red-lit press shots, because there is no spin room or treadmill floor anywhere in the
asset library shot in these colours. Two photographs would fix it — a lit spin room and a
treadmill floor, both women-only — and they are the only real gap left in the set.

**About.** New hero — your curtain-and-mats photograph, upscaled 2x before it ships so it renders
about 1:1 rather than being stretched. The repeated 50% statistic is gone, replaced by **Our
philosophy**: what the product actually claims, and why. The science paragraph is about adherence and
group cohesion rather than survival odds, so it does not lean on the same study twice, and it cites
Farrance, Tsofliou & Clark in Preventive Medicine. Margaret's sociology background is a short closing
note rather than a headline — it reads as grounding there, and as overclaiming anywhere higher up.
Each founder letter now has a dashed photo placeholder beside the signature.

**Two new flows.** `#/book/:class` is the booking hand-off: already book with this studio, need to
set up an account, or just hold the plan. `#/setup` is the profile step between creating an account
and landing on the profile — neighborhood, what you do, when you go, one line about you, and a photo
slot. Both are marked as drafts, because you said you would send the real fields.

**Writing stories.** The Read page has a composer — headline, category, photograph, standfirst, body
— that lays your draft out in the real design. It saves to your browser only: no server, so nothing
you write there reaches anyone else or survives clearing site data. When a draft is right, **Copy for
publishing** puts it on the clipboard and I bake it into the site permanently. A real CMS is the
answer eventually; this is the honest version until there is a backend.

## Corrections

**The class list sat below the map, not beside it.** `exSchematic()` emitted one unbalanced
`</div>`, left over when the drawn map became the tile map's fallback. The browser closed
`.ex-panel` and `.ex-layout` early on it, which ejected the class list from the grid entirely. The
grid itself was always correct. Fixed at the source, and the split now holds down to 660px rather
than 900px, so it survives a narrow window or a side panel.

**About** now opens on a marked placeholder rather than a photograph, ready for the real hero.

**Our philosophy is its own band** — a full-width taupe panel with a photograph down the left,
cream type on dark. It was reading as a continuation of the section above because it shared the
ground, the width and the type.

**The founders section is one letter, not two postcards**, laid out to your reference: a script and
serif lockup, a joint message, one signature from both of you, and a portrait placeholder on the
right for the photograph of the two of you.

## Photography rules now in force

**Retired, do not reuse:** `hero-running.jpg` (the track photograph) and `community-three.png` (the
three women in rust and pink). Both are gone from every route and from the fallback photo map that
new activities draw from; running activities now use `pin-stretch.jpg`.

**Studio photographs are graded, not chosen for colour.** Each studio shows what it actually does,
and the plate puts them all through one treatment so they can share a grid: `grayscale(1)` on the
photograph, then a `--cocoa` layer in `multiply` at 72% and a vertical scrim over the top. CycleBar's
red spin room and Barry's red floor come out the same warm monochrome as the cream studios. The
studio detail pages get a lighter version of the same grade. To dial it, the two rules are
`.plate-photo`'s filter and `.tile-plate:before`'s opacity in `styles.css`.

**The script face is Italianno, not Parisienne.** Parisienne is a rounded brush script — friendly,
and reads young. Italianno is a formal Spencerian script with long swashes and high stroke contrast,
which is the register your reference was in. It is set through `--script` in `styles.css`, so it is
one line to change: `Pinyon Script` is the more compact engraved alternative, and dropping to
`Cormorant Garamond` italic removes the script entirely.

**Placements now:** ritual 01 is a single figure (`pin-legs.jpg`), 02 the pilates balls, 03 the
overhead rug. Connect closes on `pin-olive.jpg`. Club Pilates shows `pin-matclass.jpg`. The
philosophy band shows `studio-sculpt.jpg`, which was freed by moving the shared-rituals article onto
`detail-weights.jpg`.

## Placeholders over bad fits

A card can now carry a marked placeholder instead of a photograph (`img:null` on any event or club).
Where nothing in the library is right, that is what goes in — a taupe square with a frame icon and
PHOTO TO COME — rather than a picture that nearly works. The morning mat club is the first one:
there is no yoga photograph here in these colours that does not have a problem.

**Deleted from the build entirely, not just unreferenced:** `hero-yoga.png`, `hero-running.jpg`,
`community-three.png`, `brand-orangetheory-run.jpg`, `community-women.jpg`, the three generated
`ritual-*.webp` squares, `cover-coffee.jpg`, `cover-inset.jpg`, `about-studio.jpg` and
`pin-olive.jpg`. They are off the disk, so none of them can come back by accident.

**The Connect sequence** is a single figure (`pin-legs.jpg`), the kit laid out (`studio-still.jpg`),
and two women sitting together (`pin-rug.jpg`). The dead `steps` array from an earlier layout has
been deleted, as have the `img` fields on the `studios` array now that `STUDIO_PHOTO` owns that map.

## One photograph, one subject

No photograph now stands for two different things anywhere on the site. Every slot — cover,
the three Connect frames, the statistic band, the philosophy band, the sign-up panel, eight studios,
four articles, two sample clubs — holds a picture used for nothing else. Verified by walking all
22 routes and comparing what renders.

What does repeat is a subject appearing on its own card and its own page: Barry's photograph is on
the Barry's tile and the Barry's page; an article's photograph is on its card and at the top of the
article. That is identification rather than repetition, and removing it would mean a second
photograph for every studio and every story — twelve more pictures that do not exist. If you
would rather those slots were empty than repeated, the placeholder is one edit per slot.

The sample activities and anything a member creates now carry the placeholder instead of borrowing a
photograph from somewhere else on the site.

## The ViRi edit gains its first real article

**The Truth About the September Wellness Reset**, by Margaret Cole, 19 September 2026, is in as the
first story on the Read page and the first card in the edit row on the home page. Margaret's text is
unedited; the only things added around it are the standfirst on the card and under the photograph,
and the link markup on the 2014 fresh-start-effect study.

The article template now carries a byline: author and date in tracked small caps under the headline,
and the standfirst set in Cormorant italic beneath the photograph. Any article with an `author` field
gets both; the older sample stories have none, so they render as before.

`Mindset` is a new category, sitting first in the Read filter chips. The photograph is `reading.jpg`
and it appears nowhere else.

## The article layout

Rebuilt to the Every Girl reference. The masthead is two columns: category, headline, standfirst,
then date and byline down the left; the photograph on the right at 4:5. Below that, a two-column
body — a 230px rail on the left carrying the newsletter box and **Read next**, and the prose in a
66ch column beside it. The rail is sticky, so both follow you down the page.

Read next lists the three most recent other stories, newest first, each with category, headline and
date. The newsletter box is preview-only: submitting it shows a notice and clears the field, because
there is no server and no address goes anywhere.

Cards carry the publish date under the number. Dates are stored as `YYYY-MM-DD` and built with
`new Date(y, m-1, d)` rather than parsed from the string, which would otherwise render a day early
in a US timezone. Both grids sort newest first, so **No. 01** is always the latest. The four sample
stories carry invented past dates and will be replaced by real ones.

**Margaret's article text is untouched.** The rendered paragraphs were diffed word for word against
what she sent; only the surrounding layout changed.

Two stale rules came out while doing this. A blanket `grayscale(1)` on `.tile-media img` was left
from when studio press shots lived in the card grid — it had been draining the colour out of the
article photographs, which is why the reading picture looked monochrome on its card and full colour
on its page. And a `.map-frame` rule left from the OpenStreetMap iframe was desaturating the whole
map, markers and credit chip included.

The story composer now offers only photographs nothing else on the site uses, so writing a new piece
cannot introduce a duplicate.

## Stories tab removed

The whole `#/reviews` route is gone: the page, the card builder only it used, the header and menu
links, the footer link, and the "All member stories" link under the quote on the home page. The
quote itself stays where it was, with its byline, because one line of testimony in the flow of the
home page is worth more than a tab of invented ones. `#/reviews` now falls through to the not-found
page. The `reviews` array stays in `app.js` — the home page quote reads from it.

## Phones keep the desktop composition — SUPERSEDED 22 September 2026

**This section describes behaviour that has since been reversed. See "Phones reflow again" at the
end of this file.** Kept for the reasoning and the viewport-unit audit, both of which still hold.

Asked for on 20 September: the site should look the same on a phone browser as it does on a
desktop, rather than reflowing.

The page used to tell phone browsers it was `width=device-width`, which put the viewport at around
390 CSS pixels and fired every mobile breakpoint — cover rails hidden, the article photograph
jumping above its title, the Explore map sitting on top of the class list instead of beside it, the
footer collapsing to two columns. `index.html` now declares a fixed **1280px** canvas, so a phone
lays the page out exactly as a desktop does and scales the whole thing to fit the screen.

A short inline script re-asserts that at runtime. It is needed because some hosts — the published
artifact link among them — inject their own `width=device-width` viewport tag and drop the one in
the file. The script rewrites it on load and again at `DOMContentLoaded`.

`html` also gained `text-size-adjust:100%`, without which iOS Safari inflates body text on a
wide-viewport page and breaks the proportions it was asked to preserve.

The mobile breakpoints stay in `styles.css`. At a 1280px viewport none of them fire, but they still
do their job when a desktop window is narrowed, so nothing was deleted.

Every viewport unit on the page was checked first: `--cover-h`, `.about-hero`, `.connect-wrap`,
`.feature-connect`, `.cls-list` and `.roster` all use `min(Nsvh, Npx)`, so a scaled viewport
resolves each of them to its pixel clamp rather than growing without limit. The Explore map already
bound `touchstart` / `touchmove` / `touchend` alongside its mouse handlers, so panning works.

Verified across emulated iPhone (390), iPhone SE (320), Android (412) and iPad (820), plus a local
reconstruction of the artifact host's wrapper. All five produce identical computed layout values on
five routes — same three-column card grid, cover rails present, article head and rail in two
columns, classes to the right of the map, the pinned Connect sequence intact — and
`scrollWidth === clientWidth` everywhere, so nothing overflows sideways.

Two known consequences, both accepted. Text is about a third of its desktop size on a phone, which
is the unavoidable cost of keeping a 1280px composition; pinch-zoom still works. And the studio
photo reveal is a hover effect, so on a touch screen a studio tile stays in its resting state until
it is tapped through.

## Phones reflow again

Asked for on 22 September: people opening the site on a phone should get a mobile version rather
than a shrunken desktop one. This undoes the section above.

**The viewport is `width=device-width, initial-scale=1, viewport-fit=cover`** and the inline script
that re-asserted the 1280px canvas is deleted. The breakpoints that were dormant since 20 September
— 660, 760, 820, 900, 980, 1040 and 1180px — now do the work they were written for. Nothing in
them had to change: the responsive layer was still intact, which is why this was a small change
rather than a rebuild.

Four fixes on top of that:

**The article photograph no longer jumps above its headline.** `.article-figure` carried
`order:-1` in the 900px block, which put the picture first and pushed the category, headline and
standfirst below it. Removed, so a phone reads in the same order as the desktop masthead —
category, headline, standfirst, byline, then the photograph, then the prose.

**Form fields are 16px on a phone** (`.field input/select/textarea`, and bare `input/select/
textarea`, inside the 760px block). Below 16px, iOS Safari zooms the page in when a field takes
focus and does not zoom back out. They were 15.5px, which is enough to trigger it.

**The header icon buttons are 44×44** on a phone, up from 30×36 — the profile and menu buttons
were the two smallest tap targets on the site. Desktop keeps 30×36.

**A new `max-width:360px` block drops the `h1` clamp floor** from `2.3rem` to
`clamp(1.7rem,8.6vw,2.3rem)`. The masked headline wraps one `<span class="ml">` per word and each
is `display:inline-block`, so a long word cannot break: "conversation." on the Connect page was
305px wide inside a 280px column at 320px, the only horizontal overflow on the site. 375px and up
are unaffected.

**Checked:** 15 routes at 320, 375, 390, 412 and 768px — `scrollWidth === clientWidth` everywhere,
so nothing overflows sideways. 1440px re-checked to confirm the desktop composition is untouched:
the article masthead is still two columns, the icon buttons are still 30×36, `h1` is still 48px.
Touch behaviour exercised on a touch-emulated viewport: the menu opens and closes, a menu link
navigates, the Explore filter chips filter (11 classes to 2 on Pilates), and the map pans and
redraws its tiles.

**Still desktop-only, deliberately.** The studio tiles stay typographic on a phone. Their
photograph is a hover reveal and there is no hover on a touch screen, but the typographic plate is
the design — the photograph is the bonus — so nothing was added to force it in. The cover rails
(VITALITY RITUAL set vertically, the No. 02 seal, EST. 2026) stay hidden below 760px rather than
reflowing.

## Connect becomes Find your circle

Asked for on 23 September. The scroll-driven sequence was not working, so it is gone.

**The section no longer pins.** `initConnect()` — the sticky wrapper, the scroll handler, the
travel measurement, the hysteresis and the per-step `is-on` toggling — is deleted, along with
`.connect-wrap`, `.connect-shot` and the media-query overrides that existed only to unpin it. The
section is now an ordinary `.feature` carrying `data-reveal`, which is the same fade-up the
testimonial quote uses; its heading is already in `MASK_SELECTOR`, so the words rise on reveal
exactly as the quote's do. All three steps and their descriptions are visible at once, so the
`panel-d` grid-row collapse and the `.42` dimming both came out.

**New copy.** The heading is **Find your circle**. The steps read: *Build your profile* — what
moves you, where you go, and when; *Explore what's nearby* — add your classes; *Find your people*
— see who's booked the same classes as you, connect, and go together.

**Two photographs, stacked.** The three-photograph sequence had nothing left to sequence, so the
media column is now a two-row grid: `typing.jpg` above, `connect2.jpg` below, both supplied by
Margaret. The rows are `minmax(0,1fr)` rather than `1fr` — at `1fr` the row floor is the image's
intrinsic height, which drove the column to about 1080px per photograph and stretched the whole
feature to 2171px. Below 900px the rows go `auto` and each photograph takes a 3:2 crop at full
width. `pin-legs.jpg`, `studio-still.jpg` and `pin-rug.jpg` are no longer referenced; they stay on
disk and are now free for a story to use, and the composer's `taken` list was updated to match.

**The grade.** Both photographs carry `saturate(.62) sepia(.14) brightness(1.03) contrast(.96)` —
the same grade the Explore map tiles use. There is no site-wide lifestyle-photo filter to copy:
editorial photographs here are deliberately ungraded, and greyscaling them is ruled out earlier in
this file. This warms and mutes the two new pictures into the palette without breaking that rule.

**Checked** at 320, 390 and 1440px across fifteen routes — no horizontal overflow, no console
errors. At 1440px the feature is 620px tall in two 720px columns; at 390px the photographs stack
full-width at 390×260 each.

**Revised the same day:** the split pair was not wanted. The section carries one photograph,
`connect2.jpg`, at the standard `.feature-media` size, and `typing.jpg` is unreferenced again.
`.connect-media` is down to two declarations — the crop and the grade.

## Home page trim

Asked for on 24 September, three separate things.

**The studio carousel.** The arrows moved out of the section head and now flank the cards —
`.studio-carousel` is a three-column grid, arrow / cards / arrow, centred on the row. It no longer
wraps: paging runs CycleBar through to Barry's and stops on an **All studios** card, a darker
`--taupe-deep` plate linking to `#/studios`, so the last thing you can click is a way out rather
than a loop back to the start. Both arrows disable at their ends, and `syncStudioNav()` keeps that
state right when the grid is re-rendered without a full route render. Studio cards lost their
`intro` line and the `· sample` suffix; they now read just `93 members`, with the illustrative
caveat left on the one `section-foot` note below the grid. Below 760px the carousel becomes a flex
row so the cards keep the full content width and the two arrows sit centred underneath.

**The longevity band is text only.** The `coffee-table.jpg` photograph and the *Wellness goes
beyond the workout* eyebrow are both gone, and the block is no longer a `.feature` — it is a
`.longevity-split` section on the `--cream-2` ground with a two-column `.longevity-grid`:
**Connection is part of longevity** set large on the left, the 50% figure, the explanation and the
*Find your circle* link on the right, and the citation underneath behind a hairline rule. The
whole block used to be one enormous `<a>`; only the link is a link now. One column below 980px.
The heading was added to `MASK_SELECTOR` so it keeps the word-rise the old `.feature-copy h2` had.

**The edit lost its categories.** The filter chips are gone from the Read page, the `tag` label is
gone from article and draft cards on both the home page and the Read index, and `readCategory`
with its `read-filter` action are deleted. The Read page shows every story. `.edit-section`
tightens the space above the title and between the head and the cards, so heading, *All stories*
and all three photographs land inside one 900px screen — measured at 771px from the top of the
section head to the bottom of the cards.

**Left alone deliberately:** an article's own page still reads *Mindset · The ViRi edit* above its
headline. That is the article masthead documented earlier in this file rather than a category
control, so it stayed; say the word if it should go too.

**Checked** at 320, 390 and 1440px across fifteen routes — no overflow, no console errors. The
carousel was paged end to end: six steps from CycleBar to the All studios card, next disabling on
the last step and prev on the first.

### Corrections to the above

**`.section + .section{padding-top:0}` was eating both new sections.** Making the longevity band a
`.section` put it next to the studio section and put the edit next to *it*, so the rule at line 105
collapsed the top padding on both — the 50% figure sat on the edge of its column and the hairline
over **The ViRi edit** landed on the band boundary. That selector is two classes; a bare
`.edit-section` is one, so it never stood a chance. Both are now `.section.edit-section` and
`.section.longevity-split`, which tie on specificity and win on order. Worth remembering before
adding another `.section` to the home page.

**The longevity band is centred and bigger.** `.longevity-grid` is `align-items:center` rather
than `start`, so the heading and the figure block balance against each other instead of both
hanging from the top, and the section carries `clamp(72px,8.4vw,126px)` of its own vertical
padding. The figure also takes `padding-top:.12em` — the numeral is set on a `.9` line-height, so
its ascender crowds the edge without it.

**No. and date are left-aligned again.** `.tile-index` was `align-items:flex-end;text-align:right`
because a category tag used to sit opposite it in the `.tile-meta` row. With the tag gone it was
the only child and its contents still hugged right, which read as a stray indent. Now
`flex-start` / `left`, flush with the headline beneath it.

**A separator before the review.** `.testimonial:before` draws a hairline across the content width
— `min(1320px, 100% - 2 × gutter)`, matching `.wrap` — so the member quote reads as its own
section rather than running on from the edit grid.

## Sign up: photograph, panel, statement

Asked for on 24 September, from a mock-up and a coming-soon page as reference. It replaces a run
of attempts at animating "sign up" as handwriting — a `clip-path` wipe, a `stroke-dashoffset`
mask, and twice drawing the word as a true single-stroke path. **None of them worked and the idea
was dropped.** For the record, so nobody spends the afternoon on it again: masking real type
always reads as a reveal rather than writing, and hand-authoring six cursive letters as béziers
came out illegible both times, closer to "eign up". Doing it properly needs single-stroke path
data exported from something like SVGator, not letterforms invented in a text editor.

**The layout.** A full-bleed band holding `tennis-court.webp`, `calc(100svh - var(--header))` tall
with a 540px floor, so the photograph runs from under the header to the foot of the screen and the
footer only appears on scroll. A `--cocoa` panel sits centred and a little above the middle with
the heading, two fields and the button — 320px wide, deliberately modest against the photograph
rather than the focal point; the old **A new ritual. / A new circle. / A little more you.** returns as display type
across the foot of the photograph, set in Bodoni rather than the mock-up's sans so it sits in the
same voice as the cover. The heading is Bodoni italic, mixed case, which is the one place the site
uses italic display type — it matches the reference without inventing a new register. The button
is `.button.light`, the cream-on-dark variant that already existed for panels like this.

**The crop needs watching.** The source is 1200×1800 and the band is far wider than it is tall, so
at desktop widths only about a third of the frame is visible — at `object-position:center 42%` it
showed the wall and cut the figures' heads off. It is `center 70%` now, which holds both women and
the court. Below roughly 700px wide the band is taller than the scaled image and the full height
shows instead, so the crop only matters on desktop.

**Two fields, then the existing flow.** The page takes first and last name only. `bindSignup`
joins them into `joinData.name`, sets `joinStep` to 1 and sends you to `#/join`, which therefore
opens on the email question rather than asking for the name a second time. Stepping back from
there shows the name already filled in. Nothing downstream changed: the last join step still
writes the same `state.profile` and hands off to `#/setup`. The form is `novalidate` so both
messages come from `bindSignup` rather than one from the browser.

**Checked** at 390 and 1440px across fourteen routes — no overflow, no console errors. The flow
was walked end to end: an empty submit is refused, a first name alone is refused, both names open
`#/join` at step 02/04, and stepping back shows "Margaret Cole" prefilled. Login is untouched and
still opens a saved profile from its email field.

## Alignment, Barre3, and two features archived

Asked for on 27 September.

**The studio carousel lines up with its photographs.** When the arrows moved out of the section
head they became the leftmost and rightmost things in the row, so *Find your next favorite*, *All
studios* and the member-count footnote were all aligning to the arrows rather than to the cards.
`.studio-section .section-head` and `.section-foot` now carry
`padding-inline:calc(38px + clamp(10px,1.5vw,22px))` — one arrow plus one gap — which puts the
heading and the footnote on the left edge of the first photograph and the link on the right edge
of the last. Below 760px the arrows sit under the cards and the inset is reset to zero.

**The longevity heading is level with the 50%.** `.longevity-grid` was `align-items:center`, which
centred each column against the other and dropped the heading below the figure. It is `start` now;
measured one pixel apart.

**Instagram is live.** The footer icon and the contact page both point at
`https://www.instagram.com/vitalityritual.co/`, new tab, `rel="noopener"`. The contact page used to
say the account was coming soon.

**Barre3 is in every city.** Eight venues added to `VENUES` in `explore-data.js`, one per city, all
category `Barre`, in neighbourhoods deliberately away from each city's existing barre studio so the
map does not stack two pins. Classes generate from venues, so this produced 151 Barre3 classes
across all eight cities with no other change. It is not in the `studios` array, so it does not
appear in the home page carousel or on `#/studios` — as asked.

**Create an activity and community clubs are archived, not deleted.** Both are in
`archive/clubs-and-activities.md` with their full source: `seedClubs`, `createActivity()`, the two
click handlers, the explore-page markup, and the old dead `explore`/`filteredEvents()` pair that
went with them. The CSS they used is deliberately still in `styles.css`, and `state.created` is
still in the saved state shape, so nobody's existing preview data is destroyed and restoring is
mostly a paste.

**One trap worth recording.** `eventCard()` spans three lines, and removing it by matching the
first line alone left two orphaned continuation lines and a page that would not parse —
*Unexpected token '?'*, every route blank. It also turned out `eventCard` is still needed: the
profile page uses it for a suggested plan, which is neither a club nor part of the create flow. It
was restored in full from the `gh-pages` copy. The other four removals were genuinely single-line,
which was checked against the original before trusting it.

**Checked** at 390 and 1440px across thirteen routes — nothing empty, no overflow, no console
errors. Barre3 confirmed rendering in the explore list; alignment confirmed by measuring the text
ranges rather than the border boxes, which is what made the footnote look wrong at first.

## Barre3 joins the studios page

Asked for on 27 September, straight after the explore change: the studios page should list every
brand that appears on the map, not a subset.

Barre3 is now a ninth entry in the `studios` array, so it appears on `#/studios`, in the home
carousel and at `#/studios/barre3` with its own copy. Its photograph is `barre-white.jpg`, which
was sitting in the story composer's offered pool but had never actually been displayed anywhere —
so taking it keeps the one-photograph-one-subject rule, and because the composer's `taken` set is
built from `Object.values(STUDIO_PHOTO)` it removed itself from the pool automatically.

**The one thing that did not adapt on its own** was the member count. `studioCard()` reads from a
positional array, `[128,96,84,112,105,76,93,68]`, indexed by `studios.indexOf(s)` — eight long, so
a ninth studio rendered "undefined members". Extended to nine. Everything else in the carousel is
derived from `studios.length` and adjusted by itself: the paging went from six steps to seven, the
All studios card now reads "9 in Washington, DC", and it still ends on Barre3 followed by that card.

**An inconsistency surfaced while checking the two lists matched.** `explore-data.js` wrote the
brand as `"Barry's"` with a straight apostrophe while the rest of the site uses the typographic
`Barry’s`, so the same studio rendered two ways depending on the page. Normalised in the data, all
seven venues. Nothing compares brand strings to studio names, so it is display-only and safe.

**Checked** the brand list from `VIRI.venues` against the names rendered on `#/studios`: nine each
and identical, no missing and no extras. Sixteen routes at 1440px and nine at 390px, nothing empty,
no overflow, no console errors.

## Find your circle — new photograph and roomier framing (28 September 2026)

The section now uses `connect-kerb.jpg`: the supplied kerb photograph with the red workout set
recoloured brown and the two garment logos painted out. The masters and the whole pipeline are in
`project/Photos/` and `project/tools/photo-recolour/README.md`.

The old framing cropped its photograph to **51% of the image height**, which on a 3:4 portrait
cuts heads and shoes. Three changes fix that:

- `.feature-connect .feature-media` takes `min-height:clamp(440px,50vw,760px)`. Because the
  column is also 50vw, the box is square from roughly 880px to 1520px of viewport, so the crop is
  **identical at every width in that range** (75% of the image height) instead of getting worse as
  the column grows. Below 880px the floor makes it taller than wide, which shows more, not less.
  Above 1520px the cap stops the band running away, at the cost of a little more crop.
- `object-position` moved from `center 38%` to `center 44%`, which balances headroom above the
  bun against the dead road below the shoes.
- The steps breathe to match the taller panel: `padding-block:clamp(18px,3.4vw,50px)` on each
  list item, with a little more room around the heading and the link. List items went from 77px
  to 142px tall at the 1280px canvas.

Stacked under 980px the media is full width, so it gets its own
`min-height:clamp(420px,92vw,620px)` — a square box there would be enormous. At 375px it shows
88% of the image.

Checked at 1280, 1440 and 375. `.feature` is used only by this section, so none of it reaches
anything else.

## Faces out of the Find your circle photograph, plus a batch of fixes (29 September 2026)

### The photograph

The right-hand woman was in three-quarter profile, looking at her friend mid-sentence, and the
expression was not what the section wanted. Turning her head is generative work — inventing the
back of a skull, an ear and a jawline the camera never saw — and there is no AI image tooling on
this machine, so the honest options were a crop, a different photograph, or an outside tool. The
crop won because swapping photographs would have thrown away the recolour.

`connect-kerb.jpg` is now 955x878, cut below both chins. That leaves it slightly **landscape**
(1.088), where the previous version was 3:4 portrait, and the two interact badly if you are not
careful:

- The two columns must be the same height, so **the panel has to fit inside the media box**. At
  first the panel's generous step spacing drove the box to 545px tall against a 512px column, which
  made it *portrait*, and a landscape picture in a portrait box loses its **width** — it cut 14% off
  the sides and took her arm with it.
- Sizing the box to the picture's exact aspect fixed the crop but showed every last inch of asphalt
  and read bottom-heavy.
- What works: keep the box a little **shorter** than the picture's own aspect so the overflow is
  vertical, and anchor it with `object-position:center top` so all of it is spent on the road.
  `min-height:clamp(340px,40vw,660px)` against a 50vw column does that, trimming ~12% off the bottom
  at 1280. Stacked under 980px the media is full width and takes `aspect-ratio:955/878` instead,
  which is exact — zero crop at 375px.
- Step spacing came down from `clamp(18px,3.4vw,50px)` to `clamp(12px,1.9vw,30px)` to fit, so list
  items are 104px at 1280 rather than 142px. Still well above the original 77px.

### The seal

Replaced with the brand kit's own mark. The hand-rolled SVG ran `VITALITY RITUAL EST. 2026` as a
single run around the ring, so the back half sat upside down; the kit splits it top and bottom with
the two dots flanking the monogram. Both are inlined into `app.js` with the C2PA metadata stripped
and `#5A4433` swapped for `currentColor`, so `.footer-seal` can still tint it cream. Letterforms are
already outlined, so neither needs a font, and neither carries an `id`, so inlining twice is safe.

I first put the reduced `viri-02` (no ring type) in the cover rail, because the rail sets its own
"Est. 2026" caption under a hairline and the full seal repeats it. That was an unrequested change
and was reverted: `viri-01` is the mark everywhere. The rail caption still duplicates the seal's
own EST. 2026 — left alone deliberately, since it is site furniture rather than the logo.

### Header and the profile page

`Join` and the profile icon were two controls for the same destination, so the text link is gone and
the icon is the single entry point — it now goes to `#/signup` rather than to a mock profile.

The profile page is archived to `archive/profile-page.md` and comes back as the post-login
destination once sign-up and login are finished. `#/profile` redirects to `#/signup` so old links
do not 404. Only `profilePage()` and its router arm were removed; `eventCard()`, `postActivity()`,
the three profile action handlers and every profile CSS rule were deliberately left in place, and
the archive lists the seven redirects that were temporarily pointed elsewhere.

### Smaller things

- Longevity copy: the closing sentence is now "VIRI functions by bringing you the connections that
  already exist in your day-to-day routines."
- The Holt-Lunstad source line is deleted; the study is linked on **308,849 people** instead. It
  needed the old `.longevity-source a` underline moved onto `.longevity-lede a` — without it the
  link was the same colour as body text with no decoration, so nothing showed it was clickable.
- The brand name is **VIRI** in caps everywhere (47 replacements). Every occurrence was checked to
  be a standalone word first; the JS global `VIRI` and the `viri-*` asset filenames are different
  casings and untouched.
- The ViRi edit numbers now run oldest-first: `allArticles()` is sorted newest-first, so `index+1`
  was making the newest No. 01. `artNo()` counts down the array instead, making the number a stable
  issue number — oldest is No. 01, newest is No. 05, and the home page's `slice(0,3)` keeps the same
  indices so the three newest show their real numbers.
- The rule before the join finale's eyebrow is removed; centred, it read as a stray mark beside the
  text rather than as a lead-in. It is left in place on every other eyebrow.

Checked across 16 routes with no console errors, plus 1280, 1440 and 375px on the home page.

## Explore: no city label, no coach in search (29 September 2026)

The page head's eyebrow printed the current city's name, which read as "VIRI is a Washington thing"
directly above the city tabs that say otherwise. Removed, along with the `const city=exCity()` it
was the only consumer of — the tabs use `ex.city`, which is a different variable.

Coach came out of the search: both the placeholder's promise and the haystack in the filter, which
was `c.title + brand + area + cat + coach`. Verified after: studio, category and neighbourhood
queries still match (Barre3 3, Pilates 4, Shaw 3) and a coach name now returns 0.

Coach names are still *displayed* on class cards, in the class modal and on the booking page — that
is display rather than search, so it was left alone.

## Remove the story composer; studios lede; about-page rule (29 September 2026)

The VIRI edit is written by Margaret and Annabel, not by members, so the "Write a story" composer
came out. Archived to `archive/story-composer.md`: `draftCard()`, `writeStory()`, `copyStory()`, the
composer button on `#/read`, the Edit / "Copy for publishing" bar on a draft article, and the
`write-story`, `copy-story` and `delete-story` handlers.

Removing it left three things that a naive delete would have missed, all found by grepping for each
identifier rather than trusting the obvious ones:

- Both tile grids branched `a.draft?draftCard(...):articleCard(...)`. With drafts gone the branch is
  dead, so both collapse to `articleCard`.
- `allArticles()` merged `state.drafts` ahead of `articles` before sorting. It keeps the sort and
  drops the merge; every other caller (`artNo`, `readNext`, `readPage`) is untouched.
- The article detail eyebrow still branched on `a.draft` to print "Your draft · saved on this device
  only". Simplified to "The VIRI edit".

`drafts:[]` stays in `defaultState`, so anything already written in someone's browser is not
destroyed — same convention as the clubs archive.

Also: the studios lede is now "Add your favorite places to move, then find your people.", and the
rule before the about page's "Vitality Ritual" eyebrow is removed, matching the join finale.

Checked across 16 routes with no console errors; the edit still lists five articles numbered 01–05
and the home page shows 05/04/03.
