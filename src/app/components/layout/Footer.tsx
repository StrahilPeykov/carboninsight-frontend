import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="bg-white dark:bg-gray-900 mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Footer Links */}
          <nav
            className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-4"
            aria-label="Footer navigation"
          >
            <div className="flex flex-wrap justify-center sm:justify-start space-x-6 text-sm">
              <Link
                href="/support"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
              >
                Support & Help
              </Link>
              <Link
                href="https://brainportindustries.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
                aria-label="About Brainport Industries (opens in new tab)"
              >
                About Brainport Industries
                <span className="sr-only">(opens in new tab)</span>
              </Link>
              <Link
                href="mailto:s.manders@brainportindustries.nl"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
                aria-label="Email Project Manager"
              >
                Contact Project Manager
              </Link>
            </div>
          </nav>

          {/* Copyright and Attribution */}
          <div className="text-center">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Carbon Footprint Calculator. Funded by the European
              Union.
            </p>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
              <small>
                Views and opinions expressed are those of the authors only and do not necessarily
                reflect those of the European Union or Health and Digital Executive Agency (HaDEA).
              </small>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
