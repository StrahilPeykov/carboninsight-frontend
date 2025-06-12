import type { Metadata } from "next";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TourProvider } from "@/hooks/useTour";
import TourOverlay from "./components/ui/TourOverlay";
import TourNavigationGuide from "./components/ui/TourNavigationGuide";
import SmartTourTrigger from "./components/ui/SmartTourTrigger";
import GlobalCompanyChangeHandler from "./components/GlobalCompanyChangeHandler";
import KeyboardShortcutsProvider from "./components/KeyboardShortcutsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonInsight - Product Carbon Footprint Calculator",
  description:
    "Calculate your product carbon footprint and generate Digital Product Passports compliant with AAS standards",
  keywords: "carbon footprint, PCF, digital product passport, DPP, sustainability, AAS",
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
          <ThemeProvider>
            <TourProvider>
              <KeyboardShortcutsProvider>
                <GlobalCompanyChangeHandler />
                <SmartTourTrigger />
                <Navbar />
                <main id="main-content" className="flex-grow" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
                <TourOverlay />
                <TourNavigationGuide />
              </KeyboardShortcutsProvider>
            </TourProvider>
          </ThemeProvider>
        </AuthProvider>

        {/* Consolidated live regions */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          <div id="status-announcements"></div>
        </div>
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          <div id="error-announcements"></div>
        </div>
      </body>
    </html>
  );
}
