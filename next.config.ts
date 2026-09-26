import path from "node:path";
import type { NextConfig } from "next";

// Security headers for every page. The content policy only allows this site's own files; inline
// scripts stay allowed because Next.js and the no-flash theme script in layout.tsx rely on them.
// In development the policy is left off, since hot reloading needs eval and websockets.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : []),
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in an X-Powered-By header
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  webpack: config => {
    // @shadergradient/react only declares an "import" export condition, which webpack
    // doesn't pick up on the server pass, so resolve its ESM build directly
    config.resolve.alias["@shadergradient/react$"] = path.resolve(
      __dirname,
      "node_modules/@shadergradient/react/dist/index.mjs"
    );
    return config;
  },
};

export default nextConfig;
