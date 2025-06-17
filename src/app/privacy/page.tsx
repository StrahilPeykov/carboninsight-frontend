"use client";

import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);
  const lastUpdated = "May 2024";

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <p>
            We collect information necessary to provide our carbon footprint calculation services.
          </p>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Account Information
            </h3>
            <p>
              When you create an account, we collect your name, email address, and company
              affiliation. Your account credentials are securely hashed and never stored in plain
              text.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Business Data
            </h3>
            <p>
              To calculate carbon footprints, we collect company information (name, VAT number,
              registration number), product specifications, supply chain data, and emissions
              calculations. This data is essential for generating accurate Carbon Footprint
              Reports.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Usage Data</h3>
            <p>
              We automatically collect standard log data including IP addresses, browser type, and
              pages visited to improve our service and ensure security. We also track feature usage
              patterns to enhance user experience.
            </p>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">How We Use Your Information</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your information enables us to provide comprehensive carbon footprint services.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          We use your data to calculate product carbon footprints, generate Carbon Footprint
          Reports, and facilitate secure data sharing between supply chain partners. This
          information helps us improve our services, develop new features, and communicate important
          updates. We also use it to ensure platform security, prevent fraud, and comply with legal
          obligations.
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Data Sharing and Disclosure</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            <strong>We do not sell your personal or business data.</strong> We share information
            only in these specific circumstances.
          </p>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              With Your Consent
            </h3>
            <p>
              When you explicitly approve data sharing with supply chain partners or other
              authorized users within your organization.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Service Providers
            </h3>
            <p>
              We work with trusted third parties who assist in operating our service, all bound by
              strict confidentiality agreements.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Legal Requirements
            </h3>
            <p>We may disclose information when required by law or to protect rights and safety.</p>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Data Security</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We implement industry-standard security measures to protect your data.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          All data is encrypted in transit using HTTPS and at rest using modern encryption
          standards. We maintain secure authentication with session management, conduct regular
          security audits, and provide comprehensive employee training. Our infrastructure is hosted
          on secure, EU-based cloud servers with robust access controls.
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Your Rights Under GDPR</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>You have comprehensive rights regarding your personal data.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Access & Portability</h3>
              <p className="text-sm">Request a copy of your data in a portable format</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Rectification & Erasure</h3>
              <p className="text-sm">Correct inaccurate data or request complete deletion</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Restriction</h3>
              <p className="text-sm">Limit how we process your data</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Objection</h3>
              <p className="text-sm">Object to certain types of processing</p>
            </div>
          </div>

          <p className="mt-4">
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:privacy@carboninsight.win.tue.nl"
              className="text-red hover:text-red-700 underline"
            >
              privacy@carboninsight.win.tue.nl
            </a>
          </p>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Data Retention</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We retain your data only as long as necessary.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400">
            Account data is kept until you delete your account. Product and emissions data is
            retained for 5 years after last modification to support historical reporting. Usage logs
            are kept for 12 months for security and performance analysis. Any data required for
            legal compliance is retained as mandated by law.
          </p>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Cookies and Tracking</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We use only essential cookies necessary for the service to function properly. These
          include authentication tokens for secure login, user preferences for theme and language
          settings, and security tokens for CSRF protection. We do not use tracking cookies or
          third-party analytics services.
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Data Controller</p>
            <p className="text-gray-600 dark:text-gray-400">Brainport Industries / TU Eindhoven</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Email</p>
            <p>
              <a
                href="mailto:privacy@carboninsight.win.tue.nl"
                className="text-red hover:text-red-700 underline"
              >
                privacy@carboninsight.win.tue.nl
              </a>
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Address</p>
            <p className="text-gray-600 dark:text-gray-400">
              Eindhoven, North Brabant, Netherlands
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Last Updated:</strong> {mounted ? lastUpdated : "Loading..."}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold mb-6">Updates to This Policy</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We may update this privacy policy from time to time. We will notify you of any changes by
          posting the new policy on this page and updating the "Last Updated" date. Significant
          changes will be communicated via email to all registered users.
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
