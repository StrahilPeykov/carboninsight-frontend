"use client";

import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Link from "next/link";

export default function AccessibilityStatementPage() {
  const [mounted, setMounted] = useState(false);
  const lastUpdated = "May 2025";
  const contactEmail = "accessibility@carboninsight.win.tue.nl";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Accessibility Statement
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
          Our commitment to digital accessibility for all users
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8">
        {/* Commitment Section */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Our Accessibility Commitment</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            CarbonInsight is committed to ensuring digital accessibility for people with
            disabilities. We are continually improving the user experience for everyone and applying
            the relevant accessibility standards.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards to
            ensure our platform is accessible to all users, regardless of their abilities.
          </p>
        </Card>

        {/* Conformance Status */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Conformance Status</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            <strong>CarbonInsight is partially conformant with WCAG 2.1 level AA.</strong> Partially
            conformant means that some parts of the content do not fully conform to the
            accessibility standard.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              We are actively working to achieve full WCAG 2.1 AA compliance and address any
              accessibility barriers in our application.
            </p>
          </div>
        </Card>

        {/* Accessibility Features */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Accessibility Features</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Visual Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our platform provides full screen reader support with proper ARIA labels, semantic
                HTML structure, and keyboard navigation. We maintain WCAG AA compliant color
                contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text) and support
                browser zoom up to 200% without horizontal scrolling. All images include descriptive
                alternative text, and we offer a dark mode option to reduce eye strain.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Navigation and Interaction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every feature is accessible via keyboard with visible focus indicators throughout.
                We provide skip navigation links for easy content access and maintain consistent
                navigation patterns across all pages. All interactive elements meet the minimum
                44x44 pixel touch target size for easier interaction on mobile devices.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Content and Forms</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All form fields include descriptive labels and clear error messages linked directly
                to the relevant fields. We provide helpful instructions and validation feedback,
                with no time limits on form completion. Status messages and important updates are
                automatically announced to screen readers.
              </p>
            </div>
          </div>
        </Card>

        {/* Guidelines for Visually Impaired Users */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            Guidelines for Users with Visual Impairments
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              CarbonInsight is designed to work seamlessly with assistive technologies.
            </p>

            <div>
              <h3 className="text-lg font-medium mb-2">Screen Reader Compatibility</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our platform is fully compatible with popular screen readers including NVDA
                (Windows), JAWS (Windows), VoiceOver (macOS/iOS), and TalkBack (Android). We use
                semantic HTML and ARIA labels to ensure all content and functionality is properly
                announced.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Magnification and Zoom</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The interface remains fully functional when using browser zoom or screen
                magnification software. Text reflows properly at higher zoom levels, and all
                functionality remains accessible without horizontal scrolling at 200% zoom.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">High Contrast Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our color scheme works well with high contrast modes, and we provide a built-in dark
                mode option. All information conveyed through color is also available through text
                or other visual indicators.
              </p>
            </div>
          </div>
        </Card>

        {/* Keyboard Navigation */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Keyboard Navigation</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You can navigate CarbonInsight entirely using your keyboard.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <caption className="sr-only">Keyboard shortcuts for navigation</caption>
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Key
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">Tab</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Navigate to next interactive element
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">Shift + Tab</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Navigate to previous interactive element
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">Enter</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Activate buttons and links
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">Space</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Check/uncheck checkboxes, activate buttons
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">Escape</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Close modals and dropdown menus
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">Arrow keys</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Navigate within menus and form controls
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="mb-8" id="keyboard-shortcuts">
          <h2 className="text-2xl font-semibold mb-6">Keyboard Shortcuts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            CarbonInsight includes optional keyboard shortcuts to help power users work more
            efficiently. These shortcuts are safe and don't conflict with browser shortcuts.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <caption className="sr-only">Available keyboard shortcuts in CarbonInsight</caption>
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Shortcut
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      /
                    </kbd>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Focus search field
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    Works on any page with a search field
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      ?
                    </kbd>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Show keyboard shortcuts help
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    Brings you to this section
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      N
                    </kbd>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Create new item
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    Creates product or company based on current page
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      Escape
                    </kbd>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Close modals and menus
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    Universal close action
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
              <li>• Shortcuts are disabled when typing in form fields to avoid conflicts</li>
              <li>
                • These shortcuts don't interfere with browser shortcuts like Ctrl+D or Ctrl+P
              </li>
              <li>• All functionality remains available through standard navigation</li>
              <li>• Shortcuts follow common web application conventions</li>
            </ul>
          </div>
        </Card>

        {/* Known Limitations */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Known Limitations</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Despite our best efforts to ensure accessibility, some areas may have limitations.
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Data Visualizations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Some complex charts may not have complete text alternatives yet. We're working on
                providing accessible data tables as alternatives.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">PDF Exports</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generated PDF reports may not be fully accessible. We recommend using the web
                interface for the best accessibility experience.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Third-party Content</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Some external content or tools integrated into our platform may not meet our
                accessibility standards.
              </p>
            </div>
          </div>
        </Card>

        {/* Feedback */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Feedback and Contact</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We welcome your feedback on the accessibility of CarbonInsight. Please let us know if
            you encounter accessibility barriers:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
            <p className="font-medium mb-2">Accessibility Support:</p>
            <p className="text-gray-600 dark:text-gray-400">
              Email:{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-red hover:text-red-700 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
              >
                {contactEmail}
              </a>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We aim to respond to accessibility feedback within 2 business days.
            </p>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              When reporting an issue, please include:
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              The page or feature where you encountered the issue, your assistive technology and
              browser, a description of the problem, and any error messages you received.
            </p>
          </div>
        </Card>

        {/* Technical and Legal */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Technical Specifications</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Accessibility Standard:</strong> WCAG 2.1 Level AA
            </p>
            <p>
              <strong>Last Updated:</strong> {mounted ? lastUpdated : "Loading..."}
            </p>
            <p>
              <strong>Technologies:</strong> HTML5, WAI-ARIA 1.2, CSS3, JavaScript (ECMAScript
              2015+), React 19
            </p>
            <p>
              <strong>Assessment Methods:</strong> Automated testing (axe DevTools), manual testing,
              screen reader testing
            </p>
          </div>
        </Card>

        <div className="text-center mt-8">
          <Link href="/support">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
