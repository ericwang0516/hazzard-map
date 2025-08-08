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
        {/* 統一行動瀏覽器工具列色彩，避免灰階觀感 */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        {/* iOS 僅接受 default/black/black-translucent，維持 default 以避免系統調色 */}
      </head>
      <body className={notoSans.variable}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
};
