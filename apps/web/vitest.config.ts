import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// @pixi/react's store.mjs imports 'react-reconciler/constants' without the .js
// extension. Vite strict ESM mode rejects this. This plugin resolves it manually.
function fixPixiReactConstants(): Plugin {
  const PIXI_REACT_STORE =
    /@pixi\+react[^/]*\/node_modules\/@pixi\/react\/lib\/store\.mjs$/;
  return {
    name: "fix-pixi-react-constants",
    resolveId(id, importer) {
      if (id === "react-reconciler/constants" && importer && PIXI_REACT_STORE.test(importer)) {
        // Resolve to the constants.js in the same react-reconciler copy
        const base = importer.replace(
          /node_modules\/@pixi\/react\/lib\/store\.mjs$/,
          "node_modules/react-reconciler/constants.js",
        );
        return base;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), fixPixiReactConstants()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    server: {
      deps: {
        inline: ["@pixi/react", "pixi.js"],
      },
    },
  },
});
