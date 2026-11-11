# synetic.dev

The Synetic Labs home page, served by GitHub Pages at <https://synetic.dev>.

Written in [plain-site](https://github.com/Zaffer/plain-site) style:
plain HTML, no CSS, no script, the browser's own defaults, and dark mode from one meta tag.

## Files

- `index.html`: the home page
- `projects/<name>/index.html`: one page per research project, with its images in the same folder
- `favicon.ico`: the tab icon (the browser fetches it by default)
- `CNAME`: the custom domain
- `.nojekyll`: serve the files as they are

## Editing

Edit the HTML and push to `main`. There is no build step.

- Add updates entries at the top of the Update list, newest first, as `YYYY.MM.DD`.
- Move the `NEW` mark to recent entries.
- Change "Last updated" in the footer.
- To add an image to a project page, put the file in that project's folder and add an
  `<img>` line in its Images section (the comment there shows the form).

## v0

The first site is kept on the
[`v0`](https://github.com/Synetic-Labs/synetic-dot-dev/tree/v0) branch.
