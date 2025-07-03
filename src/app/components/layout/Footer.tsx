// Next.js optimized Link component for client-side navigation
// Provides prefetching, code splitting, and performance optimizations
// Essential for maintaining SPA behavior while preserving SEO benefits
import Link from "next/link";

// Main footer component that appears at the bottom of every page in the application
// Provides essential site navigation, legal information, contact details, and funding acknowledgments
// Designed with accessibility, responsive design, and dark mode support in mind
// Follows WCAG guidelines for proper semantic structure and keyboard navigation
export default function Footer() {
  // Dynamically calculate the current year for copyright notice
  // Ensures copyright year is always current without manual updates
  // Uses JavaScript Date object to get the current year at runtime
  // This approach maintains accuracy across year transitions automatically
  const currentYear = new Date().getFullYear();

  return (
    // Main footer element with semantic HTML5 footer tag for accessibility
    // Styling includes responsive background colors for light/dark mode support
    // mt-auto pushes footer to bottom of page when content is short (sticky footer pattern)
    // Border-top provides visual separation from main content area
    // aria-label provides clear identification for screen readers and assistive technologies
    // The footer uses a landmark role implicitly through the HTML5 footer element
    // This enables screen reader users to quickly navigate to site information and legal links
    // Background colors (bg-white/dark:bg-gray-900) ensure proper contrast in both themes
    // The mt-auto utility creates a sticky footer effect using CSS flexbox on the parent layout
    // Border styling uses theme-aware colors that adapt to light/dark mode preferences
    // Focus management is handled by child elements with proper keyboard navigation support
    <footer
      className="bg-white dark:bg-gray-900 mt-auto border-t border-gray-200 dark:border-gray-700"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="space-y-8">
          {/* Top Row - Links */}
          <nav
            className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8"
            aria-label="Footer navigation"
          >
            <Link
              href="/support"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded px-2 py-1 inline-flex items-center"
            >
              Support & Help
              <svg
                className="ml-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Link>

            <span className="hidden sm:inline text-gray-300 dark:text-gray-600" aria-hidden="true">
              •
            </span>

            <Link
              href="https://brainportindustries.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded px-2 py-1 inline-flex items-center"
              aria-label="About Brainport Industries (opens in new tab)"
            >
              About Brainport Industries
              <svg
                className="ml-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>

            <span className="hidden sm:inline text-gray-300 dark:text-gray-600" aria-hidden="true">
              •
            </span>

            <Link
              href="mailto:s.manders@brainportindustries.nl"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded px-2 py-1 inline-flex items-center"
              aria-label="Email Project Manager at s.manders@brainportindustries.nl"
            >
              Contact Project Manager
              <svg
                className="ml-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </Link>
          </nav>

          {/* Funding Information */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Funded by the European Union • Developed by Brainport Industries & TU Eindhoven
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Copyright and Legal */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} Carbon Footprint Calculator. Funded by the European Union.
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-500 max-w-3xl mx-auto">
              Views and opinions expressed are those of the authors only and do not necessarily
              reflect those of the European Union or Health and Digital Executive Agency (HaDEA).
            </p>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 pt-2">
              <Link
                href="/accessibility"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded px-2 py-1"
              >
                Accessibility Statement
              </Link>

              <span
                className="hidden sm:inline text-gray-300 dark:text-gray-600"
                aria-hidden="true"
              >
                •
              </span>

              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded px-2 py-1"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
