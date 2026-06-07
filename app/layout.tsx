import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevPilot - AI-Powered Developer Tools | Resume Analyzer, GitHub Explainer, Bug Fixer & More",
  description: "Supercharge your development workflow with 5 intelligent AI tools. Get AI-powered resume analysis, GitHub repository explanations, bug fixing, code documentation, and SQL query generation. Boost your productivity today.",
  keywords: "AI developer tools, resume analyzer, GitHub explainer, bug fixer, code documentation, SQL helper, AI coding assistant, developer productivity, code analysis, debugging tools",
  authors: [{ name: "DevPilot" }],
  openGraph: {
    title: "DevPilot - AI-Powered Developer Tools",
    description: "5 intelligent AI tools to help you code faster, debug smarter, and build better",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPilot - AI-Powered Developer Tools",
    description: "5 intelligent AI tools to help you code faster, debug smarter, and build better",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
