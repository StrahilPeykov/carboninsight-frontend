import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 mt-auto" aria-label="Site footer">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Footer Links */}
          <nav
            className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-4"
            aria-label="Footer navigation"
          >
            <ul className="flex flex-wrap justify-center sm:justify-start space-x-6 text-sm list-none">
              <li>
                <Link
                  href="/support"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded px-2 py-1 inline-block min-h-[44px] flex items-center"
                >
                  Support & Help
                </Link>
              </li>
              <li>
                <Link
                  href="https://brainportindustries.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded px-2 py-1 inline-block min-h-[44px] flex items-center"
                  aria-label="About Brainport Industries (opens in new tab)"
                >
                  About Brainport Industries
                  <span className="sr-only">(opens in new tab)</span>
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
              </li>
              <li>
                <Link
                  href="mailto:s.manders@brainportindustries.nl"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded px-2 py-1 inline-block min-h-[44px] flex items-center"
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
              </li>
            </ul>
          </nav>

          {/* Copyright and Attribution */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="sr-only">Copyright</span>
              &copy; {currentYear} Carbon Footprint Calculator. Funded by the European Union.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
              <small>
                Views and opinions expressed are those of the authors only and do not necessarily
                reflect those of the European Union or Health and Digital Executive Agency (HaDEA).
              </small>
            </p>

            {/* Accessibility Statement Link */}
            <p className="text-sm pt-2">
              <Link
                href="/accessibility"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded px-2 py-1"
              >
                Accessibility Statement
              </Link>
              <span className="mx-2 text-gray-400" aria-hidden="true">
                |
              </span>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded px-2 py-1"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
