import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CruxAffairs",
  description: "Daily current affairs for competitive exam preparation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
