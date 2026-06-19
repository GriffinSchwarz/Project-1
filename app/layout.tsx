import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FleetView — Agent Operations",
  description:
    "Activate, run, and supervise a fleet of work agents — proposals, estimating, email, and Smartsheet — from anywhere.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FleetView" },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
