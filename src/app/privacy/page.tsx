"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          How we collect, use, and protect your data
        </p>
      </div>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Information We Collect</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Account Information</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Name and email address</li>
              <li>Company affiliation</li>
              <li>Account credentials (securely hashed)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Business Data</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Company information (name, VAT number, registration number)</li>
              <li>Product information and specifications</li>
              <li>Supply chain and emissions data</li>
              <li>Carbon footprint calculations</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Usage Data</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Feature usage patterns</li>
              <li>Performance metrics</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>To provide carbon footprint calculation services</li>
          <li>To generate Digital Product Passports</li>
          <li>To facilitate data sharing between supply chain partners</li>
          <li>To improve our services and develop new features</li>
          <li>To communicate important updates and changes</li>
          <li>To ensure security and prevent fraud</li>
          <li>To comply with legal obligations</li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Data Sharing and Disclosure</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>We do not sell your personal or business data. We share information only in these circumstances:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>With your consent:</strong> When you explicitly approve data sharing with supply chain partners</li>
            <li><strong>Within your organization:</strong> With other authorized users in your company</li>
            <li><strong>Service providers:</strong> With trusted third parties who assist in operating our service</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect rights and safety</li>
          </ul>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Data Security</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Encryption in transit (HTTPS) and at rest</li>
            <li>Secure authentication and session management</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and employee training</li>
            <li>Secure cloud infrastructure (EU-based servers)</li>
          </ul>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Your Rights</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>Under GDPR, you have the following rights regarding your data:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Objection:</strong> Object to certain types of processing</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@carboninsight.win.tue.nl" className="text-red hover:text-red-700 underline">
              privacy@carboninsight.win.tue.nl
            </a>
          </p>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Data Retention</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We retain your data for as long as your account is active or as needed to provide services. 
          Specifically:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>Account data: Until account deletion</li>
          <li>Product and emissions data: 5 years after last modification</li>
          <li>Usage logs: 12 months</li>
          <li>Legal compliance data: As required by law</li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Cookies and Tracking</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>We use only essential cookies necessary for the service to function:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Authentication tokens (session management)</li>
            <li>User preferences (theme, language)</li>
            <li>Security tokens (CSRF protection)</li>
          </ul>
          <p>We do not use tracking cookies or third-party analytics.</p>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Data Controller:</strong> Brainport Industries / TU Eindhoven
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Email:</strong>{" "}
            <a href="mailto:privacy@carboninsight.win.tue.nl" className="text-red hover:text-red-700 underline">
              privacy@carboninsight.win.tue.nl
            </a>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Address:</strong> Eindhoven, North Brabant, Netherlands
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold mb-6">Updates to This Policy</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We may update this privacy policy from time to time. We will notify you of any changes by 
          posting the new policy on this page and updating the "Last Updated" date.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>
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