import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 旧「このサイトについて」ページ。内容は「あそびかた」に統合した
      { source: "/about", destination: "/howto", permanent: true },
    ];
  },
};

export default nextConfig;
