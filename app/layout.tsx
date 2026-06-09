import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "DevPilot - AI-Powered Developer Tools | Resume Analyzer, GitHub Explainer, Bug Fixer & More",
  description: "Supercharge your development workflow with 5 intelligent AI tools. Get AI-powered resume analysis, GitHub repository explanations, bug fixing, code documentation, and SQL query generation. Boost your productivity today.",
  keywords: "AI developer tools, resume analyzer, GitHub explainer, bug fixer, code documentation, SQL helper, AI coding assistant, developer productivity, code analysis, debugging tools",
  authors: [{ name: "DevPilot" }],
  openGraph: {
    title: "DevPilot - AI-Powered Developer Tools",
    description: "5 intelligent AI tools to help you code faster, debug smarter, and build better",
    type: "website",
    locale: "en_US",
    siteName: "DevPilot",
    images: [
      {
        url: "/devpilot_logo.png",
        width: 1200,
        height: 630,
        alt: "DevPilot - AI-Powered Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPilot - AI-Powered Developer Tools",
    description: "5 intelligent AI tools to help you code faster, debug smarter, and build better",
    images: ["/devpilot_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/devpilot_logo.png",
    shortcut: "/devpilot_logo.png",
    apple: "/devpilot_logo.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
