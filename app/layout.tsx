import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import { SiteShell } from "@/components/site/site-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/data/site"
import { normalizeSiteUrl } from "@/lib/site-url"
import { cn } from "@/lib/utils"

const headingFont = Geist({
  subsets: ["latin"],
  variable: "--font-heading-display",
})

const bodyFont = Geist({
  subsets: ["latin"],
  variable: "--font-sans-body",
})

const monoFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
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
