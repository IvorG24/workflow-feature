console.log(
  "Build-time environment variable:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
console.log(
  "Build-time environment variable:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
