import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const geist = Geist({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: "GitHub Activity Graph",
  description: "Create and customize GitHub contribution graphs.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${geist.variable} antialiased`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
