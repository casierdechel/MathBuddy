//app/layout.tsx

import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

// Memuat Font Quicksand secara optimal
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Dashboard Belajar Matematika",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="light">
      <head>
        {/* Cara paling aman: Langsung pasang stylesheet CDN resmi Google Fonts di Head Layout */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body className={`${quicksand.variable} font-sans bg-[#f9f9ff] text-[#111c2d] antialiased`}>
        {children}
      </body>
    </html>
  );
}