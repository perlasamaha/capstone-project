import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (on by default in new Next 16 apps) is turned off: each
  // page declares its rendering strategy with route segment config
  // (`export const revalidate`) and writes call revalidatePath. See README.
  images: {
    // Avatars come from the OAuth providers.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
