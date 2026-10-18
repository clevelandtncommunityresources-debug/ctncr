# CTNCR — Cleveland, TN Community Resources

Website for Cleveland, TN Community Resources, a 501(c)(3) serving Cleveland and Bradley County, Tennessee.

A static site with no build step and no dependencies: open `index.html` in a browser.

## Files

- `index.html` — page content (hero with photo slideshow, resource directory, food calendar, bulletin board, campaigns, about, get involved, donate)
- `resources.js` — **the resource directory data**; edit this to add, change or remove listings
- `food-schedule.js` — **food calendar data**: which days and times each pantry or meal is open. The calendar shows today's food and a dropdown to pick another day
- `events.js` — **bulletin board events**; past events drop off the board automatically
- `library-events.js` — Cleveland Bradley County Public Library programs for the bulletin board. Rewritten every morning by `.github/workflows/library-events.yml` (which runs `scripts/update_library_events.py`), so don't edit it by hand. To refresh it right away: Actions tab → "Update library events" → Run workflow
- `gallery.js` — **photo slideshow list**, shown at the top of the page in the order listed; photos go in `assets/gallery/`. The slideshow stays hidden until the list has at least one photo
- `script.js` — search/filter logic, food calendar, bulletin board, photo slideshow and mobile menu
- `styles.css` — styles (includes dark mode)
- `assets/` — logo (from the CTNCR Linktree) and favicon

## Publishing with GitHub Pages

Settings → Pages → Source: "Deploy from a branch" → pick the branch and `/ (root)`.

## Keeping listings accurate

Listings were compiled from public directories (UTC MobileMOC Bradley County guide, Feeding America, and the CBFP.news food pantry, free meal and mobile pantry listings) in October 2026. Call each one to confirm hours and services before relying on it.

## Adding events, food days and photos

Each of these is a list in its own `.js` file, with instructions and an example at the top. On GitHub you can edit them right in the browser: open the file, click the pencil icon, make the change, and commit.

- **Event:** copy the example in `events.js`, remove the `//` at the start of each line, and fill it in.
- **Food day:** copy an entry in `food-schedule.js` and set `repeat` to the days it is open.
- **Photo:** upload the image to `assets/gallery/` (Add file → Upload files), then add a line to `gallery.js` with its file name and a short description.
