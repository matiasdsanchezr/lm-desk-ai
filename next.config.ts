import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": ["./example/**/*"],
  },
  allowedDevOrigins: ["192.168.1.10"],
}

export default nextConfig
