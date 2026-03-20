import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["VITE_", "RIVET_"],
  server: {
    proxy: {
      "/api/rivet": "http://localhost:6420",
      "/health": "http://localhost:6420",
    },
  },
});
