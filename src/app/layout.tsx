import type { Metadata } from "next";
import Script from 'next/script';
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import TourProvider from "./components/TourProvider";
import GlobalCompanyChangeHandler from "./components/GlobalCompanyChangeHandler";
import KeyboardShortcutsProvider from "./components/KeyboardShortcutsProvider";
import TourTrigger from "./components/TourTrigger";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonInsight - Product Carbon Footprint Calculator",
  description:
    "Calculate your product carbon footprint and generate Carbon Footprint Reports compliant with AAS standards",
  keywords: "carbon footprint, PCF, carbon footprint report, sustainability, AAS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                let theme = 'light';
                
                if (savedTheme === 'dark') {
                  theme = 'dark';
                } else if (savedTheme === 'system' || !savedTheme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                
                document.documentElement.classList.add(theme);
              } catch (e) {
                console.error('Theme initialization error:', e);
              }
            `,
          }}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
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
                <TourTrigger />
                <GlobalCompanyChangeHandler />
                <Navbar />
                <main id="main-content" className="flex-grow" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
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
