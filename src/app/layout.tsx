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

// SEO metadata configuration for the entire application
// Provides essential information for search engines and social media platforms
export const metadata: Metadata = {
  title: "CarbonInsight - Product Carbon Footprint Calculator",
  description:
    "Calculate your product carbon footprint and generate Carbon Footprint Reports compliant with AAS standards",
  keywords: "carbon footprint, PCF, carbon footprint report, sustainability, AAS",
};

/**
 * Root layout component that wraps the entire application
 * Provides essential providers, accessibility features, and global styling
 * 
 * Features implemented for accessibility compliance:
 * - Skip-to-main-content link for keyboard navigation
 * - Proper semantic HTML structure with main landmark
 * - Theme script for preventing flash of incorrect theme
 * - ARIA live regions for screen reader announcements
 * - Suppressed hydration warnings for SSR compatibility
 * 
 * @param children - Page content to be rendered within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme initialization script runs before page render to prevent FOUC */}
        {/* Critical for accessibility as it respects user's prefers-color-scheme */}
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
        {/* Skip navigation link - first focusable element for accessibility */}
        {/* Allows keyboard users to bypass repetitive navigation */}
        {/* Positioned off-screen but becomes visible when focused */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-red text-white p-3 rounded-br-md shadow-lg z-50 font-semibold"
        >
          Skip to main content
        </a>

        {/* Provider hierarchy establishes application-wide context */}
        {/* Order is important: Auth → Theme → Tour → Shortcuts */}
        <AuthProvider>
          <ThemeProvider>
            <TourProvider>
              <KeyboardShortcutsProvider>
                {/* Tour trigger component manages automatic tour initiation */}
                <TourTrigger />
                
                {/* Global handler for company selection changes across tabs */}
                <GlobalCompanyChangeHandler />
                
                {/* Primary navigation component with accessibility features */}
                <Navbar />
                
                {/* Main content landmark with proper focus management */}
                {/* tabIndex={-1} allows programmatic focus for skip links */}
                <main id="main-content" className="flex-grow" tabIndex={-1}>
                  {children}
                </main>
                
                {/* Footer component with consistent styling and links */}
                <Footer />
              </KeyboardShortcutsProvider>
            </TourProvider>
          </ThemeProvider>
        </AuthProvider>

        {/* ARIA live regions for dynamic content announcements */}
        {/* Consolidated approach prevents multiple competing announcements */}
        
        {/* Polite announcements for status updates and confirmations */}
        {/* Screen readers will announce these when convenient */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          <div id="status-announcements"></div>
        </div>
        
        {/* Assertive announcements for errors and urgent messages */}
        {/* Screen readers will interrupt current reading to announce these */}
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          <div id="error-announcements"></div>
        </div>
      </body>
    </html>
  );
}
