import type { Metadata } from "next"
import { Cinzel, Source_Serif_4 } from "next/font/google"
import { Suspense } from "react"

import { Providers } from "@/components/providers"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SkipLink } from "@/components/skip-link"
import { SITE_TAGLINE, SITE_TITLE } from "@/lib/config"
import { htmlLang, locale } from "@/lib/i18n"
import { publicBaseUrl } from "@/lib/site-url"

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

const metadataBase = publicBaseUrl() ? new URL(publicBaseUrl()!) : undefined

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_TAGLINE,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_TAGLINE,
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={htmlLang()}
      className={`${display.variable} ${body.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers locale={locale}>
          <SkipLink />
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
