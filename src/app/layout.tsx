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
  themeColor: "#002B7F",
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
    <html lang="id" style={{ backgroundColor: "#002B7F" }} className={`${plusJakarta.variable} font-sans`}>
      <body
        style={{ backgroundColor: "#002B7F", margin: 0, padding: 0 }}
        className="antialiased min-h-screen bg-[#002B7F]"
      >
        {/* Instant Native PWA Video Preloader - Plays immediately at 1.0x from millisecond 0 without waiting for JS */}
        <div
          id="pwa-native-splash"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#002B7F",
            zIndex: 99998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <video
            id="pwa-native-video"
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              backgroundColor: "#002B7F",
            }}
          >
            <source src="/VideoLoading.mp4" type="video/mp4" />
            <source src="/Video loading.mp4" type="video/mp4" />
          </video>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var v = document.getElementById('pwa-native-video');
                  if (v) {
                    v.playbackRate = 1.0;
                    v.defaultPlaybackRate = 1.0;
                    var p = v.play();
                    if (p && p.catch) { p.catch(function(){}); }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <ClubTrackerProvider>{children}</ClubTrackerProvider>
      </body>
    </html>
  );
}
