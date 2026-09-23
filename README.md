# vvid media library recreation

A local recreation of https://vvid.tv/library using React, TypeScript, and vinext/Vite. The reference page's public HTML and CSS informed the layout, typography, colors, and icons.

## Run

```sh
npm install
npm run dev
```

Open the Local URL printed by the server. Both `/` and `/library` render the library.

## Features

- Responsive sidebar, source filters, grid/list views, and light/dark themes
- Add and validate video or website links
- Search saved links, mark favorites, and track opened links
- Select and delete multiple links with confirmation
- Browser-local persistence and a tutorial dialog

The original service's accounts, subscription feeds, live YouTube search, and backend are not connected. YouTube video links open a dedicated watch screen with custom play/pause, seek, 30-second skip, mute, fullscreen, library search, and autoplay queue controls (standard, short, Shorts, live, and embed URLs are supported). Returning to the library stops playback. The watch URL can be refreshed, and browser back/forward restores the selected screen. Videos that disallow embedding can be opened on YouTube using the explicit fallback link. Other saved links open their original website in a new tab. All library data stays in localStorage on the current browser/device.

## Validation

```sh
npm run build
npx tsc --noEmit
```

The reference player was inspected in signed-in Chrome. Local playback and custom controls were checked through the browser’s Playwright interface.
# tesla

## GitHub Pages

The repository has a separate static build using the same React components. It requires no Worker or server and uses `/tesla/` as its asset base for https://sunnyyuanz.github.io/tesla/.

### Publish using gh-pages

```sh
npm run deploy
```

This first builds and validates the static site, then publishes **only `dist-pages/`** to the `gh-pages` branch on `origin`. The package creates that branch automatically. GitHub authentication and push access to the repository are required.

After the first deployment, open the repository’s **Settings → Pages**. Select **Deploy from a branch**, choose **gh-pages**, select **/(root)**, and save. The site will be available at:

https://sunnyyuanz.github.io/tesla/

The `/tesla/library/` URL also has a real static HTML entry so direct navigation and refreshing watch URLs work without server rewrites. Library data remains browser-local; localhost data does not automatically transfer to the hosted site.

### Preview and validate before publishing

```sh
npm run test:pages
npm run preview:pages
```

Open the preview URL printed by Vite with `/tesla/` appended. `npm run dev:pages` develops the static version directly. The existing `npm run dev` and `npm run build` still use the original vinext/Worker setup.

If the repository is renamed, change the default base in `vite.pages.config.ts` and `homepage` in `package.json`. For a custom domain, set `PAGES_BASE_PATH=/` when building/deploying and configure the domain in GitHub Pages.

GitHub Pages configuration follows the [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages); this project publishes with the installed gh-pages package rather than an Actions workflow.
