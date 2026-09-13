import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-nunito" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Life OS",
  description: "Daily missions for real life.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Life OS" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#202126",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${jetbrains.variable}`}>
      <body>
        <div className="mx-auto min-h-dvh w-full max-w-[430px]">{children}</div>
      </body>
    </html>
  );
}
