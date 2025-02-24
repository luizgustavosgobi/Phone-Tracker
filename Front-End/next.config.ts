import type { NextConfig } from "next";
import { RemotePattern } from "next/dist/shared/lib/image-config";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL!);

const remotePattern: RemotePattern = {
  protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
  hostname: apiUrl.hostname,
  port: apiUrl.port || "",
  pathname: "/proofs/public/**",
};

const nextConfig: NextConfig = {
  allowedDevOrigins: [apiUrl.hostname, `*.${apiUrl.hostname}`],
  images: {
    remotePatterns: [remotePattern],
  },
};

export default nextConfig;
