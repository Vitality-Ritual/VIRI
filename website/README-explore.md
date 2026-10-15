# Explore — the map, the classes, the rosters

## What is built

The Explore page is now a class browser, not an events feed. Eight cities, an interactive map, a
day-by-day class list, and — the part that is actually the product — a roster on every class showing
which ViRi members are going, with a Connect action on each of them.

| Piece | Behaviour |
| --- | --- |
| City tabs | Washington DC, New York, Los Angeles, Miami, Boston, Chicago, Philadelphia, Atlanta |
| Map | OpenStreetMap tiles. Markers carry the class count and filter the list when clicked. Drag to pan, buttons to zoom. Falls back to a drawn schematic where tiles are blocked. |
| Day strip | Today plus the next six days |
| Filters | Activity, time of day (before 9 / 9–4 / after 4), free-text search over class, studio, coach and neighborhood, and a **Members going** toggle |
| Class row | Time, class, studio, neighborhood, coach, and a stack of member avatars |
| Class detail | Opens in place of the map: the class, availability, add-to-plan, and the roster |
| Add to my plan | Goes to a hand-off page: already book with this studio, need an account, or just hold the plan. Nothing is reserved — see the booking-platform table below for what each branch would really do. |
| Roster | Every ViRi member going — neighborhood, how long they have been on ViRi, classes logged, a line in their own words, their activities, and **Connect** |
| Member profile | Click an avatar for the fuller profile and the other classes they are going to |
| Connect | Sends a request. Shows as **Requested** until accepted — the prototype does not pretend the other person said yes. Counted on your profile page. |

State lives in the same `viri-preview` localStorage record as the rest of the prototype, under the
`requests` and `drafts` keys.

## The map

It is a real slippy map now — OpenStreetMap raster tiles, drag to pan, zoom in and out, markers that
carry the class count and filter the list when clicked. It is written directly rather than with
Leaflet: the web-mercator tile maths is about forty lines, and it means no third-party CSS to inline
and no CDN to depend on. The tiles carry a light desaturating filter so a normal map does not fight
the palette, and the frame is the brand: a taupe border with a cream inset.

**In the published preview the tiles will not load.** That link runs under a content security policy
that blocks images from outside hosts, so after four failed tiles the map falls back to the drawn
schematic and says why on screen. Open the files locally, or put the site on a real host, and the
tile map appears. Nothing needs changing for that to happen.

Attribution is required by the OpenStreetMap tile policy and is in the corner of the map. Their
tile servers are fine for a prototype; for production volume you would move to Mapbox, MapTiler or
CARTO, all of which also give you a paler basemap closer to this palette.

## Where the real data would come from

This is the part worth reading carefully, because the plan in the brief — pull the studios from
Google Maps, pull the schedules from each studio's calendar — does not survive contact with how
this data is actually licensed.

### Studio locations

Google's Places API terms do not allow you to extract place data into your own database and show it
on your own map. Caching is limited to place IDs, and Google content has to be displayed on a Google
map. So "dissect it from Google Maps" is not a shortcut with a legal version — it is the one path
that is closed.

The open paths:

- **OpenStreetMap / Overpass API.** Free, ODbL-licensed, and genuinely good for `leisure=fitness_centre`
  in dense US cities. You must attribute. This is the cheapest correct answer for a v1.
- **Foursquare Places** or **Yelp Fusion.** Commercial, good coverage of boutique fitness, each with
  its own display and caching restrictions to read before you build on them.
- **Google Places API**, used the way it is licensed: as a live lookup rendered on a Google map,
  not as a source to harvest into your own dataset.

Whichever you pick, the studios you actually care about are a few hundred locations across eight
cities. That is a list a person can verify by hand in a week, and hand-verified beats scraped.

### Class schedules

There is no general feed. Every studio's schedule lives inside whichever booking platform it runs on,
and that is where the integration work is:

| Platform | Who runs on it |
| --- | --- |
| Mindbody | the long tail of independent studios, and Club Pilates |
| Mariana Tek | Barry's, [solidcore], CycleBar and much of the boutique tier |
| ABC Glofox / Momence / WellnessLiving / Zen Planner | smaller independents |
| In-house | SoulCycle, Equinox, Orangetheory, Pure Barre corporate |

Mindbody and Mariana Tek both have APIs, and both are partner-gated: you apply, you sign an
agreement, and in most cases the studio has to authorise your access to their data. Scraping the
public booking widgets instead is technically possible, fragile enough to break weekly, and against
the terms of service of every platform on that list.

This is why ClassPass took years to build. Their moat is not the software — it is the signed
agreements that put studio inventory in their app. Any version of ViRi that shows real class times
has the same requirement.

**A realistic sequence:**

1. **Do not start with inventory.** Start with members declaring intent — "I'm going to the 6.45 at
   Barry's Tuesday" — typed in, not synced. The rosters and the connecting are the product; the
   schedule is scaffolding. A studio list plus a time picker gets you the same screen with none of
   the legal exposure.
2. **Add schedules per platform, per market.** One Mindbody integration covers a long tail of DC
   independents. One Mariana Tek agreement covers several of the chains at once.
3. **Let studios claim their listing.** A studio that wants women arriving in pairs has a reason to
   give you a feed. That is a partnerships conversation, and it is the one that scales.

### The member data

Everything in the rosters is invented — names, neighborhoods, the lines they have written, how many
classes they have logged. Real rosters raise a design question worth settling early: showing who is
attending a class is a safety-relevant disclosure for the women using it. Reasonable defaults would
be opt-in per class rather than global, first name and initial only until a connection is accepted,
and no attendance visible to anyone who has not completed a profile.

## What is sample data in this build

Everything below the structure. The class times, instructors, availability, rosters and member
profiles are generated deterministically per studio per day, so they are stable across reloads but
they correspond to nothing. Studio coordinates are approximate, placed near the right neighborhood
rather than at a surveyed address. The page says so at the top, the map says so in its footer, and
every class detail says so next to the availability.

The studio brands are real and their marks are their own. Showing invented schedules under a real
brand name is fine for a private design review and not fine in public — that is a second reason,
alongside the photography, to clear rights before this is shown outside the team.
