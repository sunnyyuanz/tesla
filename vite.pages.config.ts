import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

// This repository is hosted at https://sunnyyuanz.github.io/tesla/.
// Override with PAGES_BASE_PATH=/ for a custom domain or user site.
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/tesla/",
  plugins: [
    react(),
    {
      name: "github-pages-no-jekyll",
      closeBundle() {
        writeFileSync(resolve("dist-pages/.nojekyll"), "");
      },
    },
  ],
  build: {
    outDir: "dist-pages",
    rollupOptions: {
      input: {
        home: resolve("index.html"),
        library: resolve("library/index.html"),
      },
    },
  },
});
