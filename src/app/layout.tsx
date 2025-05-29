import type { Metadata } from "next";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carbon Footprint Calculator for SMEs",
  description: "Calculate your product carbon footprint and generate Digital Product Passports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        {/* Skip to main content link - First focusable element */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-red text-white p-3 rounded-br-md shadow-lg z-50 font-semibold"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <Navbar />
          <main id="main-content" className="flex-grow" role="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </AuthProvider>

        {/* Live region for announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="live-announcements" />
      </body>
    </html>
  );
}
