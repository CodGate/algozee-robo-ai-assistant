import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robo by AlgoZee — Your AI assistant",
  description: "Meet Robo: voice conversations, text assistance and business enquiries by AlgoZee.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
