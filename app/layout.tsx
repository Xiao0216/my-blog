import type { Metadata } from "next"
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google"

import "./globals.css"

import { SiteShell } from "@/components/site/site-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/data/site"
import { normalizeSiteUrl } from "@/lib/site-url"
import { cn } from "@/lib/utils"

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading-display",
  weight: ["500", "600", "700"],
})

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans-body",
})

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  metadataBase: new URL(normalizeSiteUrl(siteConfig.siteUrl)),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn(headingFont.variable, bodyFont.variable, monoFont.variable)}
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
