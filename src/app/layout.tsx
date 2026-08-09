import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IITB Hackathon E-Commerce",
  description: "Multi-vendor marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-light text-primary-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}