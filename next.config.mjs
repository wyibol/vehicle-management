/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uedexbkjzfzszmwekcky.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'chirashima.oss-ap-northeast-1.aliyuncs.com',
      },
    ],
  },
};

export default nextConfig;
