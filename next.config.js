/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NOTION_INTEGRATION_SECRET: process.env.NOTION_INTEGRATION_SECRET,
    NOTION_PAGE_URL: process.env.NOTION_PAGE_URL,
  },
}

export default nextConfig