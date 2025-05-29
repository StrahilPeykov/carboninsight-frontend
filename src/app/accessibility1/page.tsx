"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Accessibility Statement
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Our commitment to digital accessibility for all users
        </p>
      </div>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Our Accessibility Commitment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Carbon Insight is committed to ensuring digital accessibility for people with disabilities. 
          We are continually improving the user experience for everyone and applying the relevant 
          accessibility standards.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          This website strives to conform to level AA of the Web Content Accessibility Guidelines 
          (WCAG 2.1). These guidelines explain how to make web content accessible to people with 
          a wide array of disabilities.
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Accessibility Features</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Navigation</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>Skip to main content link on every page</li>
              <li>Consistent navigation throughout the site</li>
              <li>Keyboard navigation support for all interactive elements</li>
              <li>Clear focus indicators on all interactive elements</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Visual Design</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>Sufficient color contrast ratios (WCAG AA compliant)</li>
              <li>Text can be resized up to 200% without loss of functionality</li>
              <li>Support for dark mode to reduce eye strain</li>
              <li>No reliance on color alone to convey information</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Screen Reader Support</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>Proper heading structure for easy navigation</li>
              <li>Descriptive labels for all form fields</li>
              <li>ARIA labels and descriptions where needed</li>
              <li>Status messages announced to screen readers</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Interactive Elements</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>All functionality available via keyboard</li>
              <li>Minimum 44x44 pixel touch targets</li>
              <li>Clear error messages linked to form fields</li>
              <li>No time limits on form completion</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Browser and Assistive Technology Support</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Carbon Insight is designed to work with modern browsers and assistive technologies:
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Supported Browsers</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>Chrome (latest version)</li>
              <li>Firefox (latest version)</li>
              <li>Safari (latest version)</li>
              <li>Edge (latest version)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Tested with Screen Readers</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>NVDA on Windows</li>
              <li>JAWS on Windows</li>
              <li>VoiceOver on macOS</li>
              <li>TalkBack on Android</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Known Limitations</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Despite our best efforts, some parts of Carbon Insight may not be fully accessible:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
          <li>
            <strong>PDF exports:</strong> While we strive to make exported PDFs accessible, 
            some complex data visualizations may not have complete text alternatives.
          </li>
          <li>
            <strong>Third-party content:</strong> Some supplier data imported into the system 
            may not meet our accessibility standards.
          </li>
          <li>
            <strong>Legacy file formats:</strong> Some older file formats (like certain Excel 
            templates) may have limited accessibility support.
          </li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Feedback and Contact</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We welcome your feedback on the accessibility of Carbon Insight. Please let us know 
          if you encounter accessibility barriers:
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="font-medium mb-2">Accessibility Support:</p>
          <p className="text-gray-600 dark:text-gray-400">
            Email: <a 
              href="mailto:accessibility@carboninsight.win.tue.nl" 
              className="text-red hover:text-red-700 underline"
            >
              accessibility@carboninsight.win.tue.nl
            </a>
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            We aim to respond to accessibility feedback within 2 business days.
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold mb-6">Technical Specifications</h2>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p><strong>Accessibility Standard:</strong> WCAG 2.1 Level AA</p>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Technologies:</strong> HTML, CSS, JavaScript, React, Next.js</p>
          <p><strong>Assessment Methods:</strong> Automated testing (axe DevTools), manual testing, screen reader testing</p>
        </div>
      </Card>

      <div className="text-center mt-8">
        <Link href="/">
          <Button variant="outline" size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}