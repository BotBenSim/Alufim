import type { Metadata, Viewport } from "next";
import { SerwistRegistration } from "@/components/SerwistRegistration";
import { BackgroundScene } from "@/components/scene/BackgroundScene";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alufim",
  description: "משחק חינוכי לילדים — חיות, XP והתפתחות",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <BackgroundScene />
        <SerwistRegistration />
        <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
