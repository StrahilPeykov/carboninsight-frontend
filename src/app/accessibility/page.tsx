"use client";

import Card from "../components/ui/Card";
import Link from "next/link";

export default function AccessibilityStatementPage() {
  const lastUpdated = "November 2024";
  const contactEmail = "support@carboninsight.win.tue.nl";

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Accessibility Statement
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8">
        <Card as="section" title="Our Commitment">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Carbon Insight is committed to ensuring digital accessibility for people with
            disabilities. We are continually improving the user experience for everyone and applying
            the relevant accessibility standards.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards to
            ensure our platform is accessible to all users, regardless of their abilities.
          </p>
        </Card>

        <Card as="section" title="Conformance Status">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and
            developers to improve accessibility for people with disabilities. It defines three
            levels of conformance: Level A, Level AA, and Level AAA.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Carbon Insight is partially conformant with WCAG 2.1 level AA.</strong>{" "}
            Partially conformant means that some parts of the content do not fully conform to the
            accessibility standard.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              We are actively working to achieve full WCAG 2.1 AA compliance and address any
              accessibility barriers in our application.
            </p>
          </div>
        </Card>

        <Card as="section" title="Accessibility Features">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We've implemented the following accessibility features:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Keyboard navigation support throughout the application</li>
            <li>Screen reader compatibility with proper ARIA labels and descriptions</li>
            <li>Color contrast that meets WCAG AA standards (4.5:1 for normal text)</li>
            <li>Focus indicators on all interactive elements</li>
            <li>Skip navigation links for easier navigation</li>
            <li>Semantic HTML structure with proper heading hierarchy</li>
            <li>Form labels and error messages associated with form controls</li>
            <li>Alternative text for informative images</li>
            <li>Support for browser zoom up to 200% without horizontal scrolling</li>
            <li>Reduced motion support for users with vestibular disorders</li>
          </ul>
        </Card>

        <Card as="section" title="Known Limitations">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Despite our best efforts, some areas may have accessibility limitations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Data visualizations:</strong> Some complex charts may not have complete text
              alternatives yet. We're working on providing data tables as alternatives.
            </li>
            <li>
              <strong>PDF exports:</strong> Generated PDF reports may not be fully accessible. We
              recommend using the web interface for the best accessibility experience.
            </li>
            <li>
              <strong>Third-party content:</strong> Some external content or tools integrated into
              our platform may not meet our accessibility standards.
            </li>
          </ul>
        </Card>

        <Card as="section" title="Browser Compatibility">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Carbon Insight is designed to work with the following assistive technologies:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
            <li>NVDA (Windows) with Firefox or Chrome</li>
            <li>JAWS (Windows) with Chrome or Edge</li>
            <li>VoiceOver (macOS) with Safari</li>
            <li>VoiceOver (iOS) with Safari</li>
            <li>TalkBack (Android) with Chrome</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            The platform is optimized for the latest versions of Chrome, Firefox, Safari, and Edge
            browsers.
          </p>
        </Card>

        <Card as="section" title="Keyboard Navigation">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You can navigate Carbon Insight using the following keyboard shortcuts:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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

        <Card as="section" title="Feedback">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We welcome your feedback on the accessibility of Carbon Insight. Please let us know if
            you encounter accessibility barriers:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 space-y-2">
            <p className="text-sm">
              <strong className="text-gray-900 dark:text-white">Email:</strong>{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-red hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
              >
                {contactEmail}
              </a>
            </p>
            <p className="text-sm">
              <strong className="text-gray-900 dark:text-white">Response time:</strong>{" "}
              <span className="text-gray-700 dark:text-gray-300">Within 2 business days</span>
            </p>
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Please provide as much detail as possible, including:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700 dark:text-gray-300">
            <li>The page or feature where you encountered the issue</li>
            <li>Your assistive technology and browser</li>
            <li>A description of the problem</li>
            <li>Any error messages you received</li>
          </ul>
        </Card>

        <Card as="section" title="Enforcement">
          <p className="text-gray-700 dark:text-gray-300">
            If you are not satisfied with our response to your accessibility feedback, you may file
            a complaint with the relevant authorities in your jurisdiction. In the European Union,
            this would be your national enforcement body for web accessibility.
          </p>
        </Card>

        <Card as="section" title="Technical Specifications">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Accessibility of Carbon Insight relies on the following technologies to work with the
            particular combination of web browser and any assistive technologies or plugins
            installed on your computer:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>HTML5</li>
            <li>WAI-ARIA 1.2</li>
            <li>CSS3</li>
            <li>JavaScript (ECMAScript 2015+)</li>
            <li>React 19</li>
          </ul>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            These technologies are relied upon for conformance with the accessibility standards
            used.
          </p>
        </Card>

        <Card as="section" title="Assessment and Testing">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Carbon Insight's accessibility has been evaluated through:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Automated testing using axe DevTools and Lighthouse</li>
            <li>Manual keyboard navigation testing</li>
            <li>Screen reader testing with NVDA and VoiceOver</li>
            <li>Color contrast analysis using WCAG-compliant tools</li>
            <li>Code review for semantic HTML and ARIA implementation</li>
          </ul>
        </Card>

        <div className="text-center pt-8">
          <Link
            href="/support"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
