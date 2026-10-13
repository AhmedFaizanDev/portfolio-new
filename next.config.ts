import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Stamped once per build; the footer and status feed show how fresh the deploy is.
  env: { BUILD_TIME: new Date().toISOString() },
};

export default nextConfig;
