/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isso força o site a NÃO ser estático (ativa as APIs)
  output: undefined,
  
  // Isso ajuda com imagens, caso precise
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;