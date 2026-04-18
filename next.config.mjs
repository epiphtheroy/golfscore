/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/golfscore",
  assetPrefix: "/golfscore/",
};

export default nextConfig;
