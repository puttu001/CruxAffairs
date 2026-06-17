import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";

export const metadata: Metadata = {
  title: "CruxAffairs — Daily Current Affairs",
  description: "AI-powered current affairs for UPSC, SSC, and Banking exam preparation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <MobileHeader />
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
