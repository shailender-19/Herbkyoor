import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /*
   * Allow the dev server's client JS/HMR chunks to be requested when the site
   * is opened over the LAN (e.g. from a phone at http://192.168.1.34:3000).
   * Next 16 blocks cross-origin dev-resource requests by default, which stops
   * the bundle from hydrating — leaving pagination, filters and other client
   * interactions dead even though the page renders. Dev-only; no effect on prod.
   */
  allowedDevOrigins: ["192.168.1.34", "192.168.1.*"],
  images: {
    /*
     * All artwork in this project ships as local, trusted SVG illustrations in
     * /public. next/image needs these two flags to serve SVGs. The CSP header
     * keeps them sandboxed. Swap in raster product photography + remotePatterns
     * when real assets are available.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    /*
     * Admin-uploaded images are stored in Vercel Blob in production and served
     * from the Blob CDN host, so next/image must be allowed to optimize them.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
