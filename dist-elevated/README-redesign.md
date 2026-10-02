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

## About page: philosophy copy and an inline citation (29 September 2026)

Opening section reworded, and the philosophy section's first two paragraphs revised — "what they do
not have is anyone to do it with" becomes "what is currently lacking is the consistency of having
other people to do it with", and "the women nearby" becomes "the people nearby".

The Farrance, Tsofliou & Clark citation moves off its own line and onto the word **research**, the
same move the Holt-Lunstad citation made on the home page. It needed the underline moved with it:
`.philosophy-source a` became `.philosophy-copy p a`, tuned for the dark band — an unmarked link is
invisible there, since body copy on that band is already near-white.

`.philosophy-source` and `.longevity-source` are now dead rules in `styles.css`, left in place per
the convention the clubs archive set.

## New article, and a closing note on the edit page (29 September 2026)

**"Dealing With Corporate Burnout? Here's How I Avoid it."** by Margaret Cole, 28 September 2026,
filed under Mindset. Dated newest, so it is No. 06 and leads both the edit index and the home page's
three tiles.

Its photograph is **deliberately blank** for now. Rather than invent a placeholder, it reuses the
site's existing "Photo to come" pattern (`.card-ph` + `phMark()`), which until now only appeared on
event cards and the about hero. Two call sites had to learn about it: `articleCard()` and the
article detail's `<figure>` both interpolated `${A+a.img}` unconditionally, which with an empty `img`
would have requested `assets/` and 404'd. Both now branch on `a.img`. `.card-ph` carries its own
`aspect-ratio:3/2`, which fights the 4/5 tile and figure, so it is overridden to fill its container.

The body needed `<ul>`/`<li>` styling — `.article-prose` had rules for `h2`, `p`, `a` and `em` only,
so the morning-routine list would have fallen back to browser defaults and missed the muted colour.

Two links in the source: the reference to the September reset piece is wired to `#/read/september-reset`
as an internal route rather than the absolute vitalityritual.org URL it was pasted with, so it does
not force a full page load. The other, "check out [this] article", had no URL — rendered as plain
text pending one.

**The edit's closing note.** Standalone text under the last article explaining what the edit is for.
Not a tile and not an article: `.edit-note` sits on the cream band with a rule above it so it reads
as an editorial footer. "ViRi" in the supplied copy was normalised to VIRI.

## Widen the edit's closing note into two columns (29 September 2026)

The note was a 62ch column centred in the wrap — 593px of text inside 938px at a 1024 viewport, so
172px of margin either side, and 717px tall.

"Wider" and "no more than half a page" cannot both hold at one column: filling the wrap would give a
~145 character measure, roughly twice the readable maximum. So the block spans the full wrap and the
body flows in **two columns**, which keeps the measure at 59–75ch depending on viewport.

`break-inside:avoid` on the paragraphs had to come off. It stops the browser balancing the columns,
which left the first one 150px short of the second; without it a paragraph splits across the break,
which is ordinary editorial practice. Height went 717 → 480 at 1024, and at 1440×900 the block is
430px against a 450px half-page, so it now meets the brief. `break-inside`/`break-after:avoid` stay
on the h3 so a subhead cannot be stranded at the foot of a column.

Under 860px it collapses to one column.

## Photograph for the corporate burnout article (29 September 2026)

`coat-journal.jpg` replaces the placeholder. It is the supplied image with the "Jaśnie Plan" text
taken off the notebook. At 736x920 it is exactly the 4:5 the tile and article figure use, so it is
uncropped in both.

Removing the text took three attempts, and the failures are the useful part:

- **Threshold detection does not work.** The linen weave's own dark pixels reach a luma deficit of
  ~64 and the ink only reaches ~95, so the two overlap: any cut either leaves strokes behind or eats
  the weave. The first mask swallowed the entire search box.
- **So the whole block is cloned from clean linen elsewhere on the cover** — but picking the donor by
  luma statistics also fails, because the beige coat behind the cover sits in the *same luma band* as
  the linen. A donor that passed "every pixel is plain weave" still contained the cover's lit edge
  and left a bright seam. A low-frequency flatness test rejected everything, since the reference
  weave itself has a block spread of 11.3. The donor was chosen by looking at it: x440-572, y235-309.
- **A lighting offset is not enough.** Interpolating brightness from bands above and below left the
  donor's own structure visible. The fix is a proper field swap: fit a quadratic to the ring around
  the block (which the ink never touches) and another to the donor, then keep the donor's weave and
  subtract its lighting field while adding the target's. That is what makes the patch invisible.

## Meet the founders: two letters (30 September 2026)

The section was one joint letter signed "Margaret & Annabel" beside the photograph. It is now three
columns — Margaret's letter, Annabel's, and the photograph — with the title spanning above them,
since a title inside the first column no longer made sense once there were two letters.

Margaret's letter is in, lightly edited for grammar and concision as asked: "whether it be" → "whether
it was" and then folded into a dash list; "all my classmates were also just as into" lost its doubled
comparison; "it was apparent that there was a disconnect" → "the disconnect ... was obvious"; "living
in their own world ... often living parallel lifestyles" lost the repeated verb; "I wonder when she
moved here?" became a real question; and the closing semicolon-plus-"so" became a full stop. It is
also broken into four paragraphs, which one block of text would not survive in a column this narrow.

Annabel's is a blank placeholder using the same dashed treatment as the photograph, sized to stretch
to Margaret's letter height so the two signatures sit on one baseline.

`align-items` went from `center` to `start`: with letters of different lengths, centring floats the
shorter one. Three narrow columns also break earlier than the old two did, so at 1080px the letters
pair up and the photograph goes full width, and at 820px everything stacks with the photograph first.

The joint letter it replaced is in `archive/founders-joint-letter.md`.

## Sign-up landing: scattered polaroids (30 September 2026)

`#/signup` is now a photo-dump landing in the style of the CapCut "camera shutter photo dump"
template: 10 polaroid frames scattered across the viewport, arriving one or two at a time while
JOIN NOW types in a letter at a time underneath. The frames take the full 5s; the wordmark was
retimed to land at 2.5s, which reads better than making you wait the whole way for it.

Each frame is about 40% of the page's width and 41% of its height, so every one overlaps several
neighbours — 14 smaller frames read as a sprinkle rather than a pile. Last frame lands at ~4.7s.

The wordmark is centred on the page, which took pinning the "Already have a profile" link to the
bottom: as a second grid item it made `place-items:center` centre the PAIR, which left JOIN NOW
142px high.

The frames are **blank** (`.pola-shot` is a flat taupe panel) pending photographs. Each frame's
position, rotation and delay is a custom property written by `signupPage()`, so the scatter is data
in `app.js` rather than a wall of nth-child rules, and dropping images in means putting them inside
`.pola-shot`.

Arrival order is a separate `ORDER` array from the `SPOTS` positions. Laying the delays out in
array order made the frames sweep the perimeter clockwise, which read as a ring being drawn rather
than frames landing at random; the order now jumps across the screen on every beat, and the two
pairs that share a beat are always far apart. A script check asserts it is still a permutation.

### Entrance refinements

The first pass eased each frame in over 0.62s with a drift and a fade, which read as soft. It is
now a plain pop: opacity only, 0.08s linear, no scale, no drift, no shadow movement. An
intermediate version slammed the frame down from 1.22 scale with the shadow collapsing underneath
— that read as a bump behind the picture and came out.

**A CSS trap worth recording.** The obvious way to express "just appear" is
`animation:… .01s steps(1,end) … both`. It does not hold. Every animation reported
`playState:"finished"` with the right `currentTime`, and the six shortest delays worked, but the
four longest ones still computed `opacity:0` indefinitely — the fill silently failed to apply. An
80ms linear fade is indistinguishable from an instant pop and is reliable, so that is what ships.

Arrivals are one at a time, never two, evenly spaced so the last lands exactly on 3s (ten frames,
a beat every 0.333s). The photo area is 4:5 rather than square, making each frame 258x316 at a
1280 canvas.

**The reduced-motion trap.** The site's global rule is `*,*:before,*:after{animation:none!important}`.
Everything here starts at `opacity:0` and animates up, so under that rule the whole page would have
rendered blank — a sign-up page that does not exist for anyone with the OS setting on. There is an
explicit fallback setting `opacity:1` on the frames and letters, placed after the global block so it
wins.

**The form did not go anywhere.** The tennis-court name form that used to be `#/signup` now lives at
`#/start`, and JOIN NOW links to it, so the funnel gained a step rather than losing a page:
landing → names → the existing `#/join` steps. `bindSignup()` is now bound on `start`. If you would
rather the landing go straight to `#/join`, that is a one-line change — `#/join`'s first step is
already the name step, which is what `#/start` duplicates.

## Sign-up photograph: "Cycle Syncing" retyped as "Join Now" (30 September 2026)

The masthead was replaced by compositing, not by an image editor. There is no font rasterizer in
this toolchain, so the wordmark is rendered on a canvas in the browser in Bodoni Moda italic — a
Didone, closest of the site's faces to the original masthead — and POSTed as base64 to a small local
receiver, which keeps ~40KB of image data out of the transcript. `tools/photo-recolour/warp.rb`
then solves a homography from four corner correspondences and maps the rendered type onto each
foreshortened quad, reading the type's darkness as ink coverage so the antialiasing comes free.

The old lettering is removed first, and only the **ink** pixels are — newsprint is smooth and near
white while the type is dark, so a threshold separates them, and the paper between the letters is
never touched. Inpainting the whole band instead, as the first attempt did, left an obvious pale
slab.

**The bug worth recording.** `Warp.inside?` read `return false if sign && s != sign`. `sign` holds a
boolean, so when the first edge gave a negative cross product `sign` was `false`, `&&`
short-circuited, and the mismatch check never ran — the quad then accepted *every* point outside
itself. It silently ate the bottom of "Daily News" on the main masthead, and looked like a bad
measurement rather than a logic error. Fixed to `!sign.nil? && s != sign`.

Two mastheads are retyped: the one she is holding and the top-left copy. The other four sit at
40–60px, steeply rotated and soft; corner accuracy there is worse than the glyphs are wide, and a
misaligned wordmark reads as a smudge, so those are cleanly removed and left blank — which is what
a background prop looks like at that size anyway.

Framing is `object-position:center 45%`, keeping the held newspaper and the floor copies both in
frame, with the site's warm grade over the cool studio white.

## Sign-up photograph: shown whole (30 September 2026)

`signup-viri.webp` replaces the newspaper composite. It is used **exactly as supplied** — copied
byte-for-byte with no re-encode, no crop, no grade.

That rules out `object-fit:cover`, which is how the previous two were framed. Instead the image
keeps `width:auto;height:auto` and is capped with `max-height:calc(100svh - var(--header))`, so the
whole picture scales down to the band rather than being trimmed to it. The photo column is `auto`,
so it is simply as wide as the picture turns out to be — 625px of 1280 at a 1280x860 canvas, with
the form taking the remaining 655px.

Three things could have cropped it silently, and all three are closed:

- `height:100%` on a content-sized grid row does not resolve, so the first attempt rendered at the
  natural 968px and pushed the section past the viewport. `max-height` fixes it without a crop.
- `overflow:hidden` on the photo column is removed. If anything ever does overflow here it should be
  visible rather than trimmed away.
- The global `img{object-fit:cover}` still applied. It has nothing to act on while the box matches
  the intrinsic aspect, but `object-fit:contain` is now stated so no later change to the box can
  start trimming.

Verified at 1280x860 and 375x812: rendered aspect matches the natural 776x968 to within 0.004,
scale is uniform, `filter:none`, and the whole image sits inside its column.

## New article: running essentials (30 September 2026)

"Starting Your Running Journey? Here Are Our Top Essentials to Get You Started." by Margaret Cole,
30 September 2026, filed under Movement. Dated newest, so it is No. 07 and leads the edit and the
home page's three tiles. Cover is the autumn pavement photograph.

Five product shots sit inline. They arrive as supplier photography on white, which pastes into an
editorial page as five bright rectangles, so each one goes on a cream panel with a thin rule and
`mix-blend-mode:multiply` — that drops the white into the panel and leaves the object sitting on the
page. A small caption under each carries the name and price.

The prose needed `h3` (the two water-carrier options sit under one heading) and a rule for the
author's two section breaks. Headings that are themselves product links lose the inline underline,
which would otherwise run under the whole heading.

All seven outbound links were normalised to https — two were supplied as `http://`.

There is now an older article titled "Starting your running journey? Five ways to find your circle"
(No. 03). Different piece, similar opening; worth knowing they will sit near each other in search.

## New article: saving money post-grad (30 September 2026)

"13 Ways I Save Money as a Post-Grad Girl Living on My Own" by Margaret Cole, 30 September 2026,
filed under Mindset. No. 08, the newest. Cover is the desk-and-candles photograph.

**One correction to the copy.** The title says 13 ways, the body has 13 numbered sections, but the
intro read "Here are 15 small ways". Set to 13.

Dated 1 October so it does not share a date with the running essentials piece. That tie would have
resolved on array order — `allArticles()` sorts by date descending and JS sort is stable, so
same-day articles order by position, not by id or title. A distinct date takes the guesswork out.

## Retire four articles; full-width article headline (30 September 2026)

`fall-rituals`, `running-together`, `shared-rituals` and `after-class` are out of the edit and in
`archive/edit-articles-retired.md`. Four articles remain and renumber themselves — the September
reset is No. 01 and the budgeting piece No. 04, since the number is derived from position in the
sorted list. Their four cover photographs stay in `assets` and are also copied to
`project/Photos/retired-covers/`.

Worth noting for future edits: the last two entries in the `articles` array carried their comma at
the *start* of the following line rather than the end of their own, so a "does this line end with
`},`" check rejects them. The archive records this.

**The headline moved out of the left column.** It sat in `.article-titles`, roughly half the head's
width — 585px at a 1280 canvas. The budgeting title needs 596px for its second line *at 31px type*,
so the requested two-line break could not hold there at any sensible size, and any long title wrapped
awkwardly. The eyebrow and `h1` now span the head (`grid-column:1 / -1`) with the standfirst and
figure below, giving the headline the full 1172px.

Articles can now set their own line breaks with a `titleLines` array, used only by the detail
heading — `title` stays plain for the tiles, the document title and `readNext`. The lines join with
`' <br>'` rather than `'<br>'` so `textContent` keeps the word space for screen readers and
copy-paste, and `text-wrap:balance` is dropped when a heading contains a break so balancing cannot
re-break it.

## Tile headings fill their measure (30 September 2026)

Long article titles stacked into three short lines on the edit index. Two things caused it together:
`.tile h3` was capped at `max-width:22ch` — 279px inside a 375px tile — and the global
`h1,h2,h3,h4` rule sets `text-wrap:balance`, which *evens* the lines rather than filling them, so
the first line was deliberately kept short.

Now `28ch` (355px) with `text-wrap:pretty`, which fills each line and only guards against a
stranded last word. The budgeting title went from three lines to two; shorter titles are unaffected
because they never reached the old cap.

## Sign-up contained rather than full bleed (30 September 2026)

The photograph and form ran edge to edge, which read as spread out. The pair now sits in the same
1320px measure the rest of the site uses, with the page's own `--gutter` either side — 54px of cream
at a 1280 canvas — and the columns split `1fr 1fr` so the picture stops on the centre line (its
right edge lands at 621 against a 640 midpoint). The form panel takes a 1px rule so the two halves
read as one contained block.

It is inset on three sides only — the bottom is open, so the picture runs off the foot of the
screen rather than being framed by it. The grid bottom-aligns, the section's bottom padding is
zero and the form panel drops its bottom border. Measured at 1280x900: the image's bottom edge
lands on 900, the viewport edge, with no gap under it.

The no-crop rule still holds: `max-width` and `max-height` are both caps on an auto-sized image,
so it shrinks whole to whichever runs out first — rendered 567x707 against a natural 776x968,
aspect identical, `filter:none`. Under 860px the padding and max-width are dropped so the picture
still spans the full width.

Also: the budgeting standfirst is now "The small decisions I make to save money while still living
my best life."

## Article section headings fill their lines (30 September 2026)

Headings 4, 7, 10 and 11 of the budgeting piece broke into two half-empty lines. Not a width
problem — the headings already had the full 632px prose measure. The cause was the global
`h1,h2,h3,h4{text-wrap:balance}` rule, which *evens* a two-line heading rather than filling the
first.

Measured on heading 4, line widths against a 632px measure:

- `balance` — 348 / 350 (what it was doing)
- `pretty` — 551 / 148
- `normal` — 551 / 148

`.article-prose h2,h3` now opt out with `text-wrap:pretty`, which fills the line and keeps the
orphan protection. This is the third place `balance` has caused the same complaint — the tile
headings and the detail `h1` were the other two — so it is worth remembering that the global rule
applies to every heading on the site.

## Article headline: two layouts (30 September 2026)

The budgeting piece wants three lines on its own page and two in the gallery. Those are different
elements — the detail `h1` reads `titleLines`, the tile `h3` reads the plain `title` — so they were
already independent. `titleLines` is now three entries.

Its cover also had to rise level with the headline. That meant putting the headline back in the
first column, which is where it sat before it was widened — and widening it was the fix for long
titles wrapping badly in half the measure. Both needs are real, so the header now has two modes:

- **Default** — the headline spans the head, the picture sits below it in the second column.
- **`.is-split`**, set when an article supplies `titleLines` — the headline drops into the first
  column and the picture rises beside it, tops level.

An article that sets its own breaks has taken charge of its measure, so it is safe to narrow. One
that has not is left at full width. Checked after: the budgeting piece is 3 lines at 585px with the
figure offset at exactly 0, and the running piece is back to 2 lines at 1172px — it had gone to
**five** while the narrow column applied to everything.

The `h1`'s `margin-top:8px` also came off. It pushed the headline 8px below the figure sharing its
row; the gap under the eyebrow already separates them, so the alignment is now exact by
construction rather than by a matching magic number.

## The split header across every article (30 September 2026)

All four articles now carry their own `titleLines`, so every one gets the headline-beside-the-picture
layout. Measured at 1280x900: all four `is-split`, figure top offset exactly 0, no line overflowing
the 585px column (widest is 564 on the September reset).

**The headline had to size down.** In half the measure, "Dealing With Corporate Burnout?" needs
630px *at 31px type* — it cannot sit on one line at any readable size. Rather than shrink the type
far enough to fit whole titles, the breaks fall on phrase boundaries and the split headline sizes to
`clamp(1.55rem,2.95vw,2.5rem)` — 38px at 1280, where every planned line fits. The running piece
takes five short lines; its title is simply long, and five clean breaks read better than four that
split "Running / Journey?".

**A stacking bug this introduced.** `grid-column:2` on the figure still creates an *implicit* second
column once the grid collapses to `1fr`, so the header stayed side by side on a phone — the headline
and picture were 153px and 160px wide at a 375px viewport. The placements now reset to
`grid-column:1;grid-row:auto` inside the media query. Stacked order is eyebrow, picture, headline,
standfirst.

## Sign-up form matches the picture's width (30 September 2026)

The bordered panel was already exactly the picture's width — both 567px. What was short was the form
inside it: 330px, left-aligned, leaving 192px of dead panel beside it. The form now fills the column
and the panel's side padding and border are gone, so the fields measure the same 567px as the
photograph. The tonal panel stays as a background with room above and below.

## The panel takes the picture's exact dimensions (1 October 2026)

The two columns were already the same width — 567px each. The panel was 69px *taller*: it sat on
`align-self:stretch`, so it filled the grid row from the top padding down, while the picture started
193px from the top and ran 707px. It now carries the photograph's own `776/968` ratio with
`align-self:end` and the same viewport cap the image has, so both boxes land at 567x707 from the same
top edge. Measured at 1280x900: width, height and top offsets all differ by 0.

`aspect-ratio` has to come back off when the grid stacks, or the panel would be forced into a 1.25:1
column on a phone; the media query resets it to `auto` with `height:auto` and no cap. At 375px the
panel is content-height (528px) and nothing overflows sideways.

**The "Log in" link was invisible.** `.signup-foot a` was written for the tennis page's cocoa panel
and set `color:var(--paper)` — near-white text on the cream panel. Scoped an override to
`.signup-split-inner .signup-foot a` in ink with a `--line-2` underline, so the old page keeps its
pale link and this one reads.

## Annabel's letter replaces the placeholder (1 October 2026)

The dashed `.letter-ph` box is gone and so is its CSS — it was the only thing using that class. Her
letter is now a plain `.prose` block, identical in structure to Margaret's, so `.founder-letter`'s
`flex:1` on the prose keeps both signatures on the same baseline.

**The draft was about 290 words against Margaret's 204, and the overlap was most of the difference.**
Three things were already said in the left-hand column: growing up in Colorado and finding friends
through sport, the whole college paragraph (Margaret covers it in one clause — "The pattern continued
in college"), and the closing promise to connect you with people nearby keeping the same routines.
Those came out. What stayed is the material only Annabel has — a decade of gymnastics and what a team
does for motivation — kept close to whole, plus the part of her city observation that is hers rather
than Margaret's: different neighbourhoods, different hours, and wellness being the first thing a full
schedule drops. Her opening now says "Colorado too", which reads as a shared fact rather than a
repeated one.

The result is 212 words to Margaret's 204, and at 1280 the two columns render at exactly the same
height — 738px each, prose difference 0, signatures on the same pixel. Stacked at 375 both are 335px
wide with the photograph ordered first.

## The letters get their own paper (1 October 2026)

Two columns of unboxed prose on the cream read as one wall of type. Each letter now sits on
`var(--paper)` with `clamp(24px,2.6vw,38px)` of padding and a soft `0 14px 30px rgba(59,50,42,.07)`
shadow — the house card idiom from `.review-card`, which is paper on cream with the shadow only on
hover. A permanent one is right here because a letter is an object lying on a surface, not a tile
that responds to a cursor.

The grid's `align-items:start` leaves the row content-sized, but `height:100%` on `.founder-letter`
still resolves against the row, so both sheets come out at exactly the same height and the two
signatures stay on one baseline — 388x911 each at 1280.

**The padding costs measure.** The column is 388px and the paragraphs were running at 345px
(`max-width:46ch` was binding). Inside the card the measure is 321px, so `46ch` no longer binds and
the lines fill the box. That is about 44 characters — still comfortable — but it makes each card
257px taller than the unboxed version, which widens the gap below the photograph placeholder. Left
alone: the placeholder sits at the top of its column and the space below reads as margin, and the
column is sized for a real portrait that has not been supplied yet.

## Sign-up fields label themselves (1 October 2026)

"Start with your name. The rest takes a minute." is deleted, and the two micro-labels moved inside
the inputs as placeholders. The `<label>` elements stay, carrying `.visually-hidden`, so the
`for`/`id` pairing still feeds screen readers and browser autofill — a bare `placeholder` is not an
accessible name and would also have broken `autocomplete="given-name"` heuristics.

`.visually-hidden` is `position:absolute`, so it stops being a flex item and `.field`'s `9px` gap no
longer counts it. The lede was also carrying the space under the headline with its `0 0 26px`
margin; that job moves to `.signup-split-inner form{margin-top:clamp(22px,2.4vw,32px)}`, which keeps
31px of air below "Sign up now". The panel still measures the photograph exactly: 567x707, all three
offsets 0.

## "Connect with us" becomes a real contact form (1 October 2026)

The footer link and the About CTA both said "Connect with us" and both pointed at `#/connect`, which
held two founder cards whose Email and LinkedIn buttons opened a modal admitting no address had been
supplied. Both now read "Contact us" and the page is a form: first name, last name, email, and an
inquiry box, posting to the VIRI inbox and landing on `#/thanks`.

**A static site cannot send mail**, so the form posts to FormSubmit, which relays a JSON body to one
address with no backend and no account. That address is a single constant, `CONTACT_EMAIL`, at the
head of the contact block; filling it in is the whole switch-on. The VIRI address does not exist
yet, so it is empty, and while it is empty the page says so in the site's own `note()` voice — on
the form *and* on the thank-you page, because "Your note has been sent" would otherwise be a lie
told to a real visitor on a live domain. Both notices disappear on their own the moment the constant
has a value.

Validation runs before any of that: both names, an address matching `[^\s@]+@[^\s@]+\.[^\s@]{2,}`,
and a non-empty message. A failed POST keeps the visitor on the form with their text intact rather
than sending them to a thank-you page for a note that did not go; only a 2xx — or the unconfigured
case — advances the route.

The fields follow the sign-up page: placeholders inside the boxes with `.visually-hidden` labels
still carrying `for`/`id`, so autofill and screen readers keep working. The two names share a row
down to 560px. `contact-info` and its modal are deleted along with `.contact-grid`,
`.contact-actions` and `.founder-monogram`; `.contact-card` stays, because the archived profile page
still uses it.

**Still pointing at the wrong place:** the footer's TikTok icon links to `#/connect`, which was a
reasonable placeholder when that page was "here is how to reach us" and is not one now that it is an
inquiry form. It needs the real TikTok URL.

## "It's Time to Stop Acting Like Being Busy is a Personality Trait" (2 October 2026)

Margaret's fifth piece, dated 2 October, which makes it No. 05 and the lead tile on the edit and the
home rail. Cover is the desk photograph, 736x1104, dropped in as `busy-desk.webp` with the master
alongside the others in `project/Photos`.

**The italics are inferred, not read.** The draft arrived as plain text, so the emphasis came through
as nothing at all. Four passages are set in `<em>`, all the same kind of sentence — a thought
addressed to the writer herself rather than to the reader: "I can't believe they're complaining…",
"if someone were to look at my calendar…", "did my time this week actually reflect my defined
priorities?", and the closing "would my boss, my CEO, or the humble director…". That is a consistent
rule rather than a guess per sentence, but it is still a rule I chose; a screenshot of the original
would settle it.

The lone em dash on its own line between the story and the advice is the author's section break. It
uses `.prose-break`, which the running-essentials piece already established as a hairline above the
paragraph that follows, so it is a `<p class="prose-break">` and not an `<hr>`.

**The headline took three lines, not two, and the reason is worth recording.** I measured the two
intended breaks in a canvas and got 504 and 579 against a 585px column — both fitting, comfortably
enough. They rendered on four lines. `.article-head > h1` is `text-transform:uppercase`, and the
canvas was measuring the mixed-case string: the uppercase setting is about 20% wider, so the real
widths were 602 and 726 and both lines overflowed. Measuring `s.toUpperCase()` instead gives breaks
that hold: "It's Time to Stop" / "Acting Like Being Busy" / "is a Personality Trait", at 344, 486 and
488 in 585. Lines two and three come out within 2px of each other, which is why that split was
picked over the alternatives. Verified at 1280, 1440 and 375; the figure stays top-aligned with the
headline at all three.

## Sign-up becomes five steps, and the profile comes back (2 October 2026)

First and last name stay on `#/signup`, so `#/join` opens on 02 and the counter reads out of 05.
Everything after the name is boxed — `.join-card` is paper on cream with a hairline, widened from
520 to 640px because the studio list is nine names and wants three columns.

**Step 03 holds three questions.** Primary forms of exercise (the six categories plus "No
preference"), primary times (the eight ranges), and the studios to add to favourites (all nine on
the site plus "I'm flexible"). All are multi-select. The two opt-out answers are not ordinary
checkboxes: ticking "No preference" clears every other form, and ticking any form clears "No
preference" — holding both at once states nothing. Same for "I'm flexible". The legends had to stop
being the 9.5px uppercase labels the other fieldsets use; three questions sharing a step have to read
as questions, so they are set in the display face at ~1.1rem.

**Step 04** is a `select` of all fifty states, DC and the five territories — 56 entries behind a
"Select one" placeholder — then a free-text city. The city is explicitly not required and never
turns red: it is marked `Optional` in the label instead, since absence of an error is not the same as
telling someone a field is theirs to skip.

**Step 05** takes a photo and a bio, both optional, and says so on the page. The photo does not go
into `localStorage` as it arrives: a picture off a phone is several megabytes of data URL against a
~5MB quota, so `readPhoto()` centre-crops it to a 320px square on a canvas and stores JPEG at 0.82 —
a 900x600 test image came out at 4KB. The bio shows one example as the placeholder and both of
Margaret's examples underneath. The button reads "Create my account" and lands on `#/profile`.

**The profile page is restored** from `archive/profile-page.md`, which is why that file listed what
had been deliberately left in. Only the function and its router arm came back. The redirects in its
table are pointed back: login, `bindSetup`, the setup page's "Skip for now", and the footer column.
The header icon and the menu's "Your circle" group now switch on whether a profile exists —
`syncAccountLinks()` runs on every render, sending you to `#/signup` until there is something to
show and `#/profile` after. Two things the page did not have before, because nothing fed them
until now: the avatar renders the uploaded photo (falling back to initials), and the bio sits under
the location.

Studios chosen in step 03 are written into `state.saved`, so "Saved studios" on the profile is
populated by the answer rather than being empty until someone saves one by hand.

15 routes, no console errors, logged in and logged out. 1280 and 375 — the check grid goes three
columns to two and nothing overflows.

## The exercise list opens up (2 October 2026)

Step 03's first question was the six Explore categories. It is now eighteen activities in
alphabetical order — barre through yoga, including the ones no studio on the site teaches (skiing,
snowboarding, tennis, golf, hiking, walking) — with `Other` and `No preference` held at the end
rather than sorted into the middle, since neither is an activity. Cycling splits into indoor and
outdoor, and strength becomes strength training. Sorting is case-insensitive, which is the only
reason HIIT lands before Hiking.

`No preference` keeps its opt-out behaviour and `Other` deliberately does not: Other is something you
do as well as the rest, so it combines. The time ranges are unchanged except that "8pm onward" is now
"8pm Onward", matching the other seven.

Twenty boxes still fall in three columns at 1280 with none wrapping to a second line; on a phone they
go to two columns and the six longest labels take two lines, which the grid equalises per row.

**Worth knowing:** these answers no longer map onto `VIRI.categories`, which still drives the Explore
filters and the studio categories. Someone who picks only Snowboarding has interests that Explore
cannot match on. That is fine while the studios are DC fitness brands, but matching people by
activity will need the two lists reconciled.

## A real photo cropper, and the profile panel loses two things (2 October 2026)

**The photo picker is a drop well now** — drag onto it, or click through to the file dialog. The note
about a square crop of the middle is gone, because it is no longer true: there is a cropper.

The canvas *is* the preview and *is* the file. It is 320x320 internally, displayed at 148, and
whatever is framed in it is exactly what `toDataURL` writes — there is no second render path that
could disagree with what someone sees. Zoom runs 1x to 4x about the centre of the frame, so the face
you centred stays centred as you scale; panning clamps at the edges so the square is always covered
and never shows the backing colour. A round `box-shadow` ring dims everything outside the circle,
since the avatar is round and the corners are not what you are choosing.

Two things worth recording. `toDataURL` on every `pointermove` would be wasteful, so the export
happens when a gesture ends — pointerup, the range's `change` — and once more at submit. And the
canvas is drawn at 320 but displayed at 148, so pointer deltas are multiplied by `320/rect.width`;
without that the photo moves at half the speed of the cursor and feels broken. `photoEdit` holds the
loaded `Image` at module scope, so stepping back and forward keeps the full-resolution original
rather than re-cropping a crop. Only after a reload does it fall back to the stored square.

**The bio examples became a list** of four, and the one in the placeholder is not among them — it was
redundant to show the same sentence twice.

**The profile stats went from four to three.** "Requests sent" is gone; Friends, Studios and
Activities remain. Friends is now a button that opens both lists in one dialog — who you are
connected to, and what is still pending — and pending excludes anyone already a friend, since a
request that was accepted is not still waiting. Unknown ids (the `alex` sample) fall back to a
generic line rather than rendering a raw id.

**Ritual points are archived** to `archive/ritual-rewards.md` at Margaret's request, to return later.
Four display-only places: the rewards panel, the `+100` line on each of your own feed cards, and the
post dialog's lede and toast. Nothing was stored for points — the number was always
`state.posts.length * 100` — so nothing is lost and nothing needs migrating. Two notices that listed
rewards among the illustrative things were trimmed rather than archived, being descriptions of the
preview rather than the feature.

15 routes, no console errors. 1280 and 375.

## Sessions, a feed of people, and search as the way in (2 October 2026)

The mockup is now the site. Three pages changed or arrived.

**The profile is sessions, one at a time.** The three-column Strava layout — left panel, centre feed,
right rail — is gone. The page is a profile header (avatar, name, three stats, bio, chips), a
left-aligned tab row, and a single column of sessions.

A session leads with the activity: date and place in small caps, the title in the display face, then
a strip of figures above and below a rule — distance where there is one, length, activity, how many
went, and how many of those were new to you. The note and any photograph come *after* that. That
ordering is the whole point: an Instagram grid made a photo-less post look like a hole, and a
session without a picture now reads as a session. One of the three on the page has no photograph at
all and nothing about it looks unfinished.

Tabs are Sessions / Saved studios / Going to, left-aligned with a single hairline under the active
one rather than the centred full-width bar a photo app uses. `profileTab` is module state, so
switching does not re-fetch or lose scroll.

**While you have logged nothing, three sample sessions stand in**, labelled as such above the list.
Your own posts replace them entirely the moment there is one — the page never mixes the two. The
post dialog now also asks for the activity and the place, because a session with no figures is just
a paragraph.

**Home (`#/feed`) is other people.** Same session block with an author line on top, plus one column
Strava does not have: *You know — 3 of them*. Comments stay visible on the card.

**Search (`#/find`) is the product's actual job.** Two questions. The top half is who is in a class
with you, and the match is a real overlap rather than a guess: if the class is in `state.joined` and
the person is in its `going` list, the row says "Both booked" and names the class. With nothing
booked it falls back to classes your own sign-up answers say you would attend, the heading changes
to "In classes you would go to", and the row says "Also goes" — the page never claims a shared
booking it cannot show. The fallback also caps at two people per class, because taking everyone from
the first match produced four strangers who all shared one 12:10 slot. The bottom half is classes
sorted by who is in them, not by the class. The rail says plainly what you are matched on and links
to where you change it.

**Nav.** `syncAccountLinks()` adds Home and Search to the front of the left nav once a profile
exists, and removes them when it does not. Logged out, the feed and the finder still render — they
are discovery — but the profile falls back to the login page as before.

17 routes, no console errors, logged in and logged out. 1280 and 375; the two rails drop under their
columns at 980 and the session figures rewrap at 760.

**Not done, and worth deciding:** `#/explore` still exists and now overlaps `#/find` — Explore is
city-wide class discovery with a map, Find is people-first matching. They should probably be one
page. I left Explore alone rather than delete a large working feature unasked. The old
`.profile-grid`, `.profile-panel`, `.feed-card` and `.upcoming-row` rules are also now unused but
still in `styles.css`, since `archive/profile-page.md` describes them.

## The empty right-hand third, and where Log a session goes (2 October 2026)

**Measured before changing anything.** At 1440 the profile wrap is 1320px, the header and tabs ran
the full 1320, and `.pf-body` was capped at 820 — so 500px down the right was empty from the tabs
down. The cap was not even earning its keep: `.session-note` is held to `62ch`, which is 539px, so
the 820 was only constraining the figures strip and the photograph.

`.pf-main` is now a grid of `minmax(0,1fr) 320px` and the cap is gone. The session column takes 940px
and a rail takes the rest — 940 + 60 gap + 320 = 1320, nothing left over. The rail carries what the
product is for: what is on your plan, and who is in your classes this week, both sticky. It mirrors
the feed's rail deliberately, so the two logged-in pages read as one system. Line length did not
change: the note is still 539px.

**Log a session moved up.** It sat under the list, which put the control for making a thing after all
the things, and below the fold once you had a few. It is now the first button in the profile's own
action row beside Edit profile and Share, which is where a control that acts on *your* profile
belongs. The sample-sessions line also carries it inline, where it reads as the next step rather
than a stray button.

The post dialog gained Activity and Where when sessions arrived, which left it asking for both "Your
activity" and "Activity". The title field is now "Name this session" and the dialog is headed "Log a
session".

## A way back out, and two bugs the way out exposed (2 October 2026)

**There was no log out.** The header icon went straight to `#/profile` once a profile existed, so once
you made one there was no way to see the site as a signed-out visitor again — which reads as "the
site is broken" rather than "the site remembered you". The icon is now a `<button>` with a small
account panel behind it: your name, Your profile, Home, Find people, and Log out.

Logging out does not delete the account. `state.loggedOut` is a session flag; the profile stays in
storage so you can log back in with the same email. `signedIn()` is now the single test — it replaces
every bare `!!state.profile` check in the nav, the footer, the profile route and the rails.

**Two real bugs surfaced while testing the way back in.**

`profilePage()` and `setupPage()` fall back to `authPage()` when nobody is signed in, but the router
only called `bindAuth()` for `path === 'login'`. So at `#/profile` the login form rendered with *no
submit handler at all* — the button did a native form submit and reloaded the page. It now binds on
`$('#auth-form')` being present rather than on the route that usually shows it.

And assigning `location.hash` the value it already holds fires no `hashchange`, so logging in from
`#/profile` set the state correctly and then rendered nothing — the form just sat there. `goTo(h)`
re-renders by hand when the hash is unchanged, and the four places that send you to a route you may
already be on now use it.

17 routes, no console errors. The panel fits a 375px screen (12px to 363px).

## The phone: the gutter I deleted, and a bar under the thumb (2 October 2026)

**The content ran to the edge of the screen on a phone, and it was my shorthand that did it.**
`.wrap` carries the site's gutter as `padding:0 var(--gutter)`. I wrote `.pf{padding:<top> 0 <bottom>}`
and the same on `.feed-wrap`, and a `padding` shorthand sets all four sides — so the horizontal `0`
overwrote the gutter and both pages sat flush against the glass at 375px. `.find` was fine because it
only ever set `padding-bottom`, which is why Find measured 335px wide while the profile and the feed
measured 375px. Both are `padding-block` now; all three pages start 20px in.

**Signed in on a phone, the four things you do are now under your thumb.** A fixed bottom bar —
Home, Find people, Log a session, your avatar — appears only below 760px and only when `signedIn()`.
It disappears on log out and its markup is cleared with it, so there is nothing to tab into. The
current route carries `aria-current`, the icon buttons carry `aria-label`, and the bar respects
`env(safe-area-inset-bottom)` so it clears the home indicator on a notched phone. The footer gains
matching bottom padding (via `body:has(...)`) only while the bar is showing, so nothing hides behind
it.

Desktop is untouched: the bar is `display:none` above 760px and those destinations stay in the top
nav.
