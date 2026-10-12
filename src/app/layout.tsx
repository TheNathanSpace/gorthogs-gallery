import type { Metadata } from "next"
import { Cinzel, Source_Serif_4 } from "next/font/google"
import { Suspense } from "react"

import { Providers } from "@/components/providers"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SITE_TAGLINE, SITE_TITLE } from "@/lib/config"

import "./globals.css"

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_TAGLINE,
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${body.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Suspense
            fallback={
              <div className="border-b border-gold/25 px-4 py-5 font-display text-xl text-gold">
                {SITE_TITLE}
              </div>
            }
          >
            <SiteHeader />
          </Suspense>
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
