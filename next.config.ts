import type { NextConfig } from "next";

const repoName = "dna-rna-lab";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: process.env.GITHUB_ACTIONS ? `/${repoName}` : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? `/${repoName}/` : undefined,
  images: { unoptimized: true },
};
export default nextConfig;
