import type { Metadata } from "next";
import "./globals.css";

import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});



export const metadata: Metadata = {
  title: "AqpGo - Tours en Arequipa",
  description: "Explora Arequipa con los mejores tours y experiencias únicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-white">
        {children}

      </body>
    </html>
  );
}