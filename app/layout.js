import { Noto_Sans } from "next/font/google";
import "../styles/globals.css";
import "leaflet/dist/leaflet.css";
import "../utils/deprecationFix"; // 導入棄用警告修復

import { SpeedInsights } from "@vercel/speed-insights/next";
import { LanguageProvider } from "../contexts/LanguageContext";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata = {
  title: "NTUT Hazzard Map",
  description: "NTUT Hazzard Map for chemical disaster and evacuation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-by="Eric :D">
      <head>
        <SpeedInsights/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={notoSans.variable}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
};
