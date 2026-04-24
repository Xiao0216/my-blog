import createMDX from "@next/mdx"

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  output: "standalone",
}

export default withMDX(nextConfig)
