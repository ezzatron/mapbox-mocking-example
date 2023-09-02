/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/session/abcde/map",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
