import type { Metadata, Viewport } from "next";
import { SerwistRegistration } from "@/components/SerwistRegistration";
import { StoreHydration } from "@/components/StoreHydration";
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
        <StoreHydration>
          <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        </StoreHydration>
      </body>
    </html>
  );
}
