import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import AuthGuard from "@/components/AuthGuard";
import BookmarkProvider from "@/components/BookmarkProvider";

const LOGO_URL =
  "https://res.cloudinary.com/gqwfsunp/image/upload/v1783002468/Crux_affairs_logo-removebg-preview_h6ie72.png";
const APPLE_ICON_URL =
  "https://res.cloudinary.com/gqwfsunp/image/upload/c_fit,w_130,h_130/c_pad,w_180,h_180,b_white/v1783002468/Crux_affairs_logo-removebg-preview_h6ie72.png";

export const metadata: Metadata = {
  title: "CruxAffairs — Daily Current Affairs",
  description: "AI-powered current affairs for UPSC, SSC, and Banking exam preparation",
  manifest: "/manifest.json",
  icons: {
    icon: LOGO_URL,
    apple: APPLE_ICON_URL,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CruxAffairs",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <BookmarkProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <MobileHeader />
              {children}
            </main>
            <BottomNav />
          </div>
          </BookmarkProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
