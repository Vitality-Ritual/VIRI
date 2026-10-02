# Archived: ritual points and rewards

Pulled from `project/dist-elevated/app.js` on 2 October 2026, at Margaret's
request — the feature is going in later, not now.

## What was removed

Four places, all of them display only. No state was stored for points: the
number was always derived from `state.posts.length`, so nothing is lost and
nothing needs migrating when this comes back.

| Where | Was |
|---|---|
| `profilePage()` panel | `<h3>Your ritual rewards</h3><p>${state.posts.length*100} points</p>` plus a `.small` line reading "Demo points for showing up. Reward redemptions are not available in this preview." |
| `profilePage()` feed card | `<p class="small" style="margin-top:15px">+100 ritual points · Preview</p>` on each of the viewer's own posts |
| `postActivity()` modal lede | "Post to your local preview feed and earn 100 demo ritual points." → "Post to your local preview feed." |
| `postActivity()` toast | "Activity added. You earned 100 demo ritual points." → "Activity added to your feed." |

Two notices also claimed rewards existed and were trimmed rather than archived,
since they are descriptions of the preview and not the feature: the profile's
`note()` dropped "and rewards" from "profile, feed, suggested people, and
rewards", and the preview terms page dropped "and rewards" from its list of
illustrative things.

## Putting it back

The panel block goes after the "Saved studios" list in `profilePage()` and
before `</aside>`. If points stop being `posts.length * 100` and become real,
they need a home in `state` (and in `defaultState`, and in the `confirm-clear`
reset), which the archived version never had.
