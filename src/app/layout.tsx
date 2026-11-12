import type { Metadata, Viewport } from "next";
import SwRegister from "@/components/SwRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "다음역",
  description: "남은 시간만큼 알차게, 내릴 역은 놓치지 않게",
  appleWebApp: { capable: true, title: "다음역", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="mx-auto min-h-dvh max-w-[430px] bg-white">
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
