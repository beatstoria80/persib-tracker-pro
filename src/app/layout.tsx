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
  applicationName: "PERSIB TRACKER",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Persib Tracker",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-apple.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#050811",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" style={{ backgroundColor: "#050811" }} className={`${plusJakarta.variable} font-sans`}>
      <body
        style={{ backgroundColor: "#050811", margin: 0, padding: 0 }}
        className="antialiased min-h-screen bg-[#050811]"
      >
        <ClubTrackerProvider>{children}</ClubTrackerProvider>
      </body>
    </html>
  );
}
