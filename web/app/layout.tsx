import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import { SerwistRegistration } from "@/components/SerwistRegistration";
import { StoreHydration } from "@/components/StoreHydration";
import { BackgroundScene } from "@/components/scene/BackgroundScene";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

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
    <html lang="he" dir="rtl" className={fredoka.variable}>
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
