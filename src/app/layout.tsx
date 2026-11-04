import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClubTrackerProvider } from "@/context/ClubTrackerContext";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PERSIB TRACKER • Real-Time Sports Intelligence",
  description:
    "Aplikasi pelacak seluruh elemen klub Persib Bandung terverifikasi secara mendalam dengan UI adaptif Minimalis & Pro Live Match Mode.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#060B13",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} font-sans`}>
      <body className="antialiased min-h-screen">
        <ClubTrackerProvider>{children}</ClubTrackerProvider>
      </body>
    </html>
  );
}
