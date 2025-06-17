"use client";

import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Mail } from "lucide-react";

export default function SupportPage() {
  const { user, isAuthenticated } = useAuth();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const supportEmail = "support@carboninsight.win.tue.nl";

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  const openMailClient = () => {
    let subject = "CarbonInsight Support Request";
    let body = "";

    if (isAuthenticated && user) {
      subject = "CarbonInsight Support Request";
      body = `Hello Support Team,

I need assistance with CarbonInsight.

User Details:
- Name: ${user.first_name} ${user.last_name}
- Email: ${user.email}
- User ID: ${user.id}

Issue Description:
[Please describe your issue here]

When did this issue start:
[Please specify when you first noticed this issue]

Steps you've already tried:
[Please list any troubleshooting steps you've already attempted]

Browser and Device:
- Browser: ${navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Safari") ? "Safari" : "Other"}
- Operating System: ${navigator.platform}

Thank you for your assistance.

Best regards,
${user.first_name} ${user.last_name}`;
    } else {
      body = `Hello Support Team,

I need assistance with CarbonInsight.

Issue Description:
[Please describe your issue here]

My Email Address:
[Please provide your registered email address]

When did this issue start:
[Please specify when you first noticed this issue]

Steps you've already tried:
[Please list any troubleshooting steps you've already attempted]

Thank you for your assistance.`;
    }

    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Support Center
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Get help with CarbonInsight. We're here to assist you.
        </p>
      </div>

      {/* Main Contact Section */}
      <Card className="mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>

          <div className="mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Get help with account issues, technical problems, carbon footprint calculations, or
              general questions
            </p>

            <div className="support-email-container mb-4">
              <div className="support-email-text">{supportEmail}</div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={copyEmailToClipboard}>
                  {copiedEmail ? "Copied!" : "Copy"}
                </Button>
                <Button onClick={openMailClient} className="flex items-center gap-2">
                  <Mail size={16} />
                  <span className="hidden sm:inline">Send Email</span>
                  <span className="sm:hidden">Send</span>
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">Response time: 24-48 hours</p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">What to Include in Your Support Request:</h3>
            <div className="text-left max-w-lg mx-auto space-y-2 text-gray-600 dark:text-gray-400">
              <p>• Clear description of the issue you're experiencing</p>
              <p>• When the issue started (date/time)</p>
              <p>• Steps you were taking when the issue occurred</p>
              <p>• Any error messages you've seen</p>
              <p>• Screenshots (if helpful)</p>
              {!isAuthenticated && <p>• Your registered email address</p>}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Self-Help */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Troubleshooting Guide</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Try These First:</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Hard refresh: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Try using incognito/private mode</li>
              <li>• Check your internet connection</li>
              <li>• Try a different browser</li>
              <li>• Disable browser extensions temporarily</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Common Issues:</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                • <strong>Can't log in:</strong> Check email/password, wait 5 minutes if blocked
              </li>
              <li>
                • <strong>Page not loading:</strong> Try hard refresh first
              </li>
              <li>
                • <strong>Company access:</strong> Ask your company administrator
              </li>
              <li>
                • <strong>PCF calculations:</strong> Check your product and emission data
              </li>
              <li>
                • <strong>File exports:</strong> Try downloading again or different format
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* FAQ Section */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              How do I calculate my product's carbon footprint?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Navigate to "Calculate PCF" in the main menu and follow the step-by-step process to
              input your product and emission data.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              How do I add users to my company?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Go to Companies → Company Details → Manage Users to add or remove team members.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              What file formats can I export?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              CarbonInsight supports AASX, XML, JSON, CSV, XLSX, and PDF export formats for Carbon
              Footprint Reports.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              My account is blocked, what should I do?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Account blocks are temporary (5 minutes) due to failed login attempts. Wait 5 minutes
              and try again, or contact support if the issue persists.
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="text-center space-x-4">
        {isAuthenticated ? (
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Back to Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="lg">
              Back to Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
