import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  },
};

export default nextConfig;
