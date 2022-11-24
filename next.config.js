/** @type {import('next').NextConfig} */
const nextConfig = {
  // Setting reactStrictMode to false since it causes issues in dev especially in using useEffect. According to the docs, it is safe to turn it off in dev.
  // https://reactjs.org/docs/strict-mode.html
  reactStrictMode: false,
  swcMinify: true,
  // configure svgr https://react-svgr.com/docs/next/
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
