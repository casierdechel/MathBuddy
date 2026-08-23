//app/layout.tsx
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "MathBuddy - Belajar Pecahan",
  description: "Belajar pecahan dengan cara menyenangkan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body className={`${quicksand.variable} font-sans bg-gradient-to-br from-blue-100/60 to-indigo-100/60 text-[#0b1e33] antialiased`}>
        {children}
      </body>
    </html>
  );
}