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
