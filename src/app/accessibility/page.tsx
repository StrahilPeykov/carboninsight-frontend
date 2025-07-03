// Next.js 13+ App Router directive that forces this component to render exclusively on the client side.
// This is essential for components that use browser-specific APIs, state management, or need to access
// the DOM directly. Without this directive, Next.js would attempt server-side rendering (SSR) which
// could cause hydration mismatches, especially when dealing with dynamic content or browser APIs.
// Client-side rendering ensures consistent behavior across different environments and prevents
// server/client rendering discrepancies that could break accessibility features or cause layout shifts.
"use client";

// React core imports for state management and lifecycle effects:
// - useState: Manages local component state, crucial for tracking mount status and preventing hydration issues
// - useEffect: Handles side effects and lifecycle events, used here to safely set mounted state after hydration
// These hooks are fundamental for creating interactive, stateful components in modern React applications
// and are essential for proper client-side state management and component lifecycle control.
import { useState, useEffect } from "react";
// Custom UI Card component import from the local component library. This Card component likely provides
// consistent styling, accessibility features, and layout structure across the application. Using a
// centralized Card component ensures design system consistency, easier maintenance, and standardized
// accessibility patterns throughout the entire application interface.
import Card from "../components/ui/Card";
// Next.js optimized Link component for client-side navigation. This component provides prefetching,
// automatic code splitting, and performance optimizations compared to standard HTML anchor tags.
// It enables seamless single-page application (SPA) navigation while maintaining SEO benefits
// and accessibility features like proper focus management and keyboard navigation support.
import Link from "next/link";

<<<<<<< HEAD
/**
 * Accessibility Statement Page Component
 * 
 * This component renders a comprehensive accessibility statement for CarbonInsight,
 * covering WCAG 2.1 AA compliance, keyboard navigation, screen reader support,
 * and contact information for accessibility feedback.
 * 
 * Features:
 * - WCAG 2.1 AA compliance information
 * - Keyboard shortcuts documentation
 * - Screen reader compatibility details
 * - Accessibility features overview
 * - Contact information for accessibility support
 * - Known limitations and workarounds
 * - Progressive enhancement for authenticated users
 * - Responsive design with proper semantic structure
 */
export default function AccessibilityStatementPage() {
  // State to track if component is mounted (prevents hydration issues)
  const [mounted, setMounted] = useState(false);
  
  // Contact information and last updated date for the accessibility statement
  // These values should be updated when significant accessibility changes are made
=======
// Main functional component that renders the comprehensive accessibility statement page for CarbonInsight.
// This component serves as a detailed documentation page that explains the platform's commitment to
// digital accessibility, compliance standards, available features, known limitations, and contact
// information for accessibility support. It follows WCAG guidelines and provides transparency about
// the application's accessibility status to help users understand what assistive technologies are
// supported and how to effectively navigate and use the platform regardless of their abilities.
export default function AccessibilityStatementPage() {
  // React state hook to track component mount status and prevent hydration mismatches between server and client.
  // This is a critical pattern in Next.js applications to avoid hydration errors that occur when the server
  // renders different content than what the client expects. The mounted state starts as false during SSR
  // and becomes true only after the component mounts on the client side, ensuring consistent rendering.
  // This prevents accessibility features from breaking due to hydration inconsistencies and ensures
  // that dynamic content (like timestamps) renders correctly without causing layout shifts or errors.
  const [mounted, setMounted] = useState(false);
  // Static constant containing the last update date for the accessibility statement. This provides
  // transparency to users about when the accessibility information was last reviewed and updated.
  // Regular updates to this date indicate ongoing commitment to accessibility compliance and help
  // users understand the currency of the accessibility information provided on this page.
  // The date format is human-readable and follows common documentation practices for version control.
>>>>>>> main
  const lastUpdated = "May 2025";
  // Contact email address specifically designated for accessibility-related inquiries, feedback, and support.
  // Having a dedicated accessibility email ensures that accessibility concerns are routed to the appropriate
  // team members who can address compliance issues, provide assistance with assistive technologies,
  // and respond to user feedback about accessibility barriers. This direct communication channel is
  // essential for maintaining ongoing accessibility compliance and demonstrates organizational commitment
  // to inclusive design and user support across all ability levels.
  const contactEmail = "accessibility@carboninsight.win.tue.nl";

<<<<<<< HEAD
  /**
   * Ensure component is mounted before displaying date-sensitive content
   * This prevents hydration mismatches between server and client rendering
   * Critical for maintaining consistent accessibility across SSR and client-side rendering
   */
=======
  // React useEffect hook that executes after the component mounts to set the mounted state to true.
  // This effect runs only once (due to the empty dependency array) after the initial render cycle
  // completes, ensuring that any content dependent on client-side rendering is properly handled.
  // This pattern is essential for preventing hydration mismatches in Next.js applications and ensures
  // that features requiring browser APIs or client-side state are properly initialized. The effect
  // helps maintain accessibility by preventing rendering inconsistencies that could confuse screen
  // readers or other assistive technologies during the hydration process.
>>>>>>> main
  useEffect(() => {
    // Critical state update that marks the component as fully mounted and hydrated on the client side.
    // This boolean flag transition from false to true serves multiple important purposes:
    // 1. Prevents hydration mismatches by ensuring server and client render the same initial content
    // 2. Enables conditional rendering of client-only features that depend on browser APIs
    // 3. Ensures accessibility features that require DOM manipulation work correctly after hydration
    // 4. Provides a safe mechanism to show dynamic content (like current timestamps) only after mount
    // 5. Maintains consistent user experience across different rendering environments (SSR vs CSR)
    // This pattern is crucial for accessibility compliance as it prevents screen readers from
    // encountering inconsistent content during the hydration process, which could cause confusion
    // or navigation issues for users relying on assistive technologies.
    setMounted(true);
  }, []);

  return (
    // Main container div that serves as the page wrapper with comprehensive responsive design:
    // - py-12: Applies 3rem (48px) padding top and bottom for generous vertical spacing
    // - max-w-4xl: Constrains maximum width to 56rem (896px) for optimal reading line length
    // - mx-auto: Centers the container horizontally using automatic left/right margins
    // - px-4: Base horizontal padding of 1rem (16px) for mobile devices
    // - sm:px-6: Increases to 1.5rem (24px) horizontal padding on small screens (640px+)
    // - lg:px-8: Further increases to 2rem (32px) horizontal padding on large screens (1024px+)
    // This creates a responsive layout that maintains readability across all device sizes
    // while ensuring adequate breathing room and preventing content from touching screen edges
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header with title and description */}
      {/* Semantic heading structure provides clear document outline for screen readers */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Accessibility Statement
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
          Our commitment to digital accessibility for all users
        </p>
        {/* Display last updated date only after component mounts */}
        {/* Prevents hydration mismatch between server and client rendering */}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8">
<<<<<<< HEAD
        {/* Accessibility Commitment Section - outlines our dedication to inclusive design */}
        {/* Uses Card component for consistent styling and semantic structure */}
=======
        {/* Accessibility Commitment Section */}
>>>>>>> main
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

<<<<<<< HEAD
        {/* Conformance Status Section - explains current compliance level */}
        {/* Transparency about compliance status helps users understand what to expect */}
=======
        {/* WCAG Conformance Status Section */}
>>>>>>> main
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Conformance Status</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            <strong>CarbonInsight is partially conformant with WCAG 2.1 level AA.</strong> Partially
            conformant means that some parts of the content do not fully conform to the
            accessibility standard.
          </p>
<<<<<<< HEAD
          {/* Information box highlighting our ongoing efforts */}
          {/* Visual distinction helps emphasize our commitment to improvement */}
=======

>>>>>>> main
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              We are actively working to achieve full WCAG 2.1 AA compliance and address any
              accessibility barriers in our application.
            </p>
          </div>
        </Card>

<<<<<<< HEAD
        {/* Accessibility Features Section - detailed breakdown of supported features */}
        {/* Organized into logical subsections for easier scanning and comprehension */}
=======
        {/* Platform Accessibility Features Section */}
>>>>>>> main
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Accessibility Features</h2>
          <div className="space-y-4">
            {/* Visual Accessibility subsection */}
            {/* Covers features for users with visual impairments */}
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

            {/* Navigation and Interaction subsection */}
            {/* Focuses on keyboard accessibility and interaction patterns */}
            <div>
              <h3 className="text-lg font-medium mb-2">Navigation and Interaction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every feature is accessible via keyboard with visible focus indicators throughout.
                We provide skip navigation links for easy content access and maintain consistent
                navigation patterns across all pages. All interactive elements meet the minimum
                44x44 pixel touch target size for easier interaction on mobile devices.
              </p>
            </div>

            {/* Content and Forms subsection */}
            {/* Addresses form accessibility and content structure */}
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

<<<<<<< HEAD
        {/* Guidelines for Visually Impaired Users - comprehensive support information */}
        {/* Dedicated section for users who rely on assistive technologies */}
=======
        {/* Guidelines for Visually Impaired Users Section */}
>>>>>>> main
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            Guidelines for Users with Visual Impairments
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              CarbonInsight is designed to work seamlessly with assistive technologies.
            </p>

            {/* Screen Reader Compatibility details */}
            {/* Lists specific screen readers and compatibility information */}
            <div>
              <h3 className="text-lg font-medium mb-2">Screen Reader Compatibility</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our platform is fully compatible with popular screen readers including NVDA
                (Windows), JAWS (Windows), VoiceOver (macOS/iOS), and TalkBack (Android). We use
                semantic HTML and ARIA labels to ensure all content and functionality is properly
                announced.
              </p>
            </div>

            {/* Magnification and Zoom support */}
            {/* Important for users with low vision who rely on magnification */}
            <div>
              <h3 className="text-lg font-medium mb-2">Magnification and Zoom</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The interface remains fully functional when using browser zoom or screen
                magnification software. Text reflows properly at higher zoom levels, and all
                functionality remains accessible without horizontal scrolling at 200% zoom.
              </p>
            </div>

<<<<<<< HEAD
            {/* High Contrast Support */}
            {/* Addresses needs of users with various visual sensitivities */}
=======
            {/* High contrast support subsection */}
>>>>>>> main
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

<<<<<<< HEAD
        {/* Keyboard Navigation Section - detailed keyboard interaction guide */}
        {/* Essential information for users who cannot use a mouse */}
=======
        {/* Keyboard Navigation Section */}
>>>>>>> main
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Keyboard Navigation</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You can navigate CarbonInsight entirely using your keyboard.
          </p>
          {/* Keyboard shortcuts reference table */}
          {/* Table format provides clear structure for keyboard combinations and their functions */}
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
                {/* Basic keyboard navigation shortcuts */}
                {/* These are standard interactions that work throughout the application */}
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

<<<<<<< HEAD
        {/* Application-Specific Keyboard Shortcuts Section */}
        {/* Custom shortcuts that enhance productivity for power users */}
=======
        {/* Custom Keyboard Shortcuts Section */}
>>>>>>> main
        <Card className="mb-8" id="keyboard-shortcuts">
          <h2 className="text-2xl font-semibold mb-6">Keyboard Shortcuts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            CarbonInsight includes optional keyboard shortcuts to help power users work more
            efficiently. These shortcuts are safe and don't conflict with browser shortcuts.
          </p>

          {/* Application-specific shortcuts table */}
          {/* Provides context-aware shortcuts that improve efficiency */}
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
                {/* Custom application shortcuts */}
                {/* Each shortcut includes notes about its context and behavior */}
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

          {/* Important notes about keyboard shortcuts */}
          {/* Provides context about when shortcuts are active and their safety */}
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

<<<<<<< HEAD
        {/* Known Limitations Section - transparency about current accessibility gaps */}
        {/* Honesty about limitations builds trust and helps users plan their interaction */}
=======
        {/* Known Accessibility Limitations Section */}
>>>>>>> main
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Known Limitations</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Despite our best efforts to ensure accessibility, some areas may have limitations.
          </p>
          <div className="space-y-3">
            {/* Data Visualizations limitations */}
            {/* Complex charts remain a challenge for accessibility */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Data Visualizations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Some complex charts may not have complete text alternatives yet. We're working on
                providing accessible data tables as alternatives.
              </p>
            </div>
            {/* PDF Export limitations */}
            {/* Generated PDFs may not inherit web accessibility features */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">PDF Exports</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generated PDF reports may not be fully accessible. We recommend using the web
                interface for the best accessibility experience.
              </p>
            </div>
            {/* Third-party content limitations */}
            {/* External integrations may not meet our accessibility standards */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Third-party Content</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Some external content or tools integrated into our platform may not meet our
                accessibility standards.
              </p>
            </div>
          </div>
        </Card>

<<<<<<< HEAD
        {/* Feedback and Contact Section - support information */}
        {/* Provides clear channels for users to report accessibility issues */}
=======
        {/* User Feedback and Contact Section */}
>>>>>>> main
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Feedback and Contact</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We welcome your feedback on the accessibility of CarbonInsight. Please let us know if
            you encounter accessibility barriers:
          </p>
          {/* Contact information box */}
          {/* Prominently displays contact details for accessibility support */}
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
          {/* Guidelines for reporting issues */}
          {/* Helps users provide comprehensive information for faster resolution */}
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

<<<<<<< HEAD
        {/* Technical and Legal Information Section */}
        {/* Provides transparency about our technical approach and compliance methods */}
=======
        {/* Technical Specifications Section */}
>>>>>>> main
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

        {/* Contact Support button - call to action */}
        {/* Provides alternative pathway to support for users who prefer direct navigation */}
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
