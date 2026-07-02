import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import AuthGuard from "@/components/AuthGuard";
import BookmarkProvider from "@/components/BookmarkProvider";

export const metadata: Metadata = {
  title: "CruxAffairs — Daily Current Affairs",
  description: "AI-powered current affairs for UPSC, SSC, and Banking exam preparation",
  icons: {
    icon: "https://res.cloudinary.com/gqwfsunp/image/upload/v1783002468/Crux_affairs_logo-removebg-preview_h6ie72.png",
  },
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
