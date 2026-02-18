import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "欢迎来到2037",
    template: "%s | 欢迎来到2037",
  },
  description: "这是一个关于未来科技和思考的博客，欢迎来到2037年的世界",
  keywords: ["未来", "科技", "2037", "博客", "Next.js", "React"],
  authors: [{ name: "Asta333" }],
  creator: "Asta333",
  publisher: "Asta333",
  metadataBase: new URL("https://unicorn777-bot.github.io"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://unicorn777-bot.github.io",
    siteName: "欢迎来到2037",
    title: "欢迎来到2037",
    description: "这是一个关于未来科技和思考的博客，欢迎来到2037年的世界",
  },
  twitter: {
    card: "summary_large_image",
    title: "欢迎来到2037",
    description: "这是一个关于未来科技和思考的博客，欢迎来到2037年的世界",
  },
  icons: {
    icon: "/images/favicon.jpg",
    shortcut: "/images/favicon.jpg",
    apple: "/images/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
