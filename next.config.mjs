import createMDX from "@next/mdx"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
}

export default withMDX(nextConfig)
