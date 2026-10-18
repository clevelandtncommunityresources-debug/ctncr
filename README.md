# CTNCR — Cleveland, TN Community Resources

Website for Cleveland, TN Community Resources, a 501(c)(3) serving Cleveland and Bradley County, Tennessee.

A static site with no build step and no dependencies: open `index.html` in a browser.

## Files

- `index.html` — page content (hero with photo slideshow, who we are and programs, neighbors' stories, resource directory, food calendar, bulletin board, campaigns, about, get involved, donate)
- `resources.js` — **the resource directory data**; edit this to add, change or remove listings
- `food-schedule.js` — **food calendar data**: which days and times each pantry or meal is open. The calendar shows today's food and a dropdown to pick another day
- `events.js` — **bulletin board events** CTNCR adds by hand (free events only); past events drop off the board automatically. The board shows a week at a time with a dropdown for later weeks
- `auto-events.js` — free events gathered every morning from the Cleveland Bradley County Public Library, Visit Cleveland TN (only listings that say they're free) and the City of Cleveland's public meetings. Written by `scripts/update_events.py`, run by `.github/workflows/update-events.yml`; don't edit it by hand. To refresh it right away: Actions tab → "Update events" → Run workflow. To correct a free/paid guess, edit `VISIT_ALWAYS_FREE` or `VISIT_NEVER` in the script
- `gallery.js` — **photo slideshow list**, shown at the top of the page in the order listed; photos go in `assets/gallery/`. The slideshow stays hidden until the list has at least one photo
- `stories.js` — **neighbors' stories** for the "In our neighbors' words" slideshow; each is paired with a photo from `gallery.js` that has no recognizable people (photos marked `people: true` are skipped)
- `script.js` — search/filter logic, food calendar, bulletin board, photo slideshow and mobile menu
- `styles.css` — styles (includes dark mode)
- `assets/` — logo (from the CTNCR Linktree) and favicon, plus lilac versions used on the site

## Branding

Colors: lilac `#CE8CBF`, coral `#FD513E`, wine `#870031`, white and black (set at the top of `styles.css`). The brand fonts (TAN Tangkiwood, Bloc, Intro Rust) aren't free web fonts, so the site uses Fraunces (soft, heavy) and Montserrat ExtraBold as stand-ins. To use the real fonts, add their web font files to `assets/fonts/` and swap them in `styles.css`.

## Publishing with GitHub Pages

Settings → Pages → Source: "Deploy from a branch" → pick the branch and `/ (root)`.

## Keeping listings accurate

Listings were compiled from public directories (UTC MobileMOC Bradley County guide, Feeding America, and the CBFP.news food pantry, free meal and mobile pantry listings) in October 2026. Call each one to confirm hours and services before relying on it.

## Adding events, food days and photos

Each of these is a list in its own `.js` file, with instructions and an example at the top. On GitHub you can edit them right in the browser: open the file, click the pencil icon, make the change, and commit.

- **Event:** copy the example in `events.js`, remove the `//` at the start of each line, and fill it in.
- **Food day:** copy an entry in `food-schedule.js` and set `repeat` to the days it is open.
- **Photo:** upload the image to `assets/gallery/` (Add file → Upload files), then add a line to `gallery.js` with its file name and a short description.
