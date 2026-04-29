import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: "Intent",
    template: "%s | Intent",
  },
  description:
    "Community networking for universities. Find mentors, collaborators, and peers — powered by your Intent.",
  applicationName: "Intent",
  keywords: [
    "networking",
    "university",
    "alumni",
    "mentorship",
    "community",
    "B2B SaaS",
  ],
  authors: [{ name: "Comply Ark" }],
  creator: "Comply Ark",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Intent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F7F8FB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>
          <TooltipProvider delay={300}>
            {children}
          </TooltipProvider>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
      </body>
    </html>
  );
}
