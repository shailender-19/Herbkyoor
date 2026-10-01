import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Mirror the Next.js "@/*" -> "src/*" path alias so imports port 1:1.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    /*
     * Dev-only convenience. When running against the real PHP backend
     * (VITE_USE_STATIC_DATA=false), start PHP separately (e.g.
     * `php -S localhost:8000 -t backend`) and this forwards `/api/*` to it so
     * the SPA avoids CORS. In the default static-data mode nothing hits /api on
     * load, so a missing PHP server is harmless. Not used in production, where
     * the SPA and PHP share one origin.
     *
     * NOTE: `/product_images/*` is intentionally NOT proxied — the bundled seed
     * images are static files served directly by Vite/Apache. If you need to
     * preview admin-uploaded images from PHP during dev, add a proxy entry.
     */
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_TARGET || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
