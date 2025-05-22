"use client";

import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";

export default function SupportPage() {
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

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Support & Account Recovery
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Need help with your account? We're here to assist you.
        </p>
      </div>

      {/* Main Contact Section */}
      <Card className="mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>

          <div className="mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Email us for account recovery, technical issues, or general questions
            </p>

            <div className="flex items-center justify-center space-x-3 mb-2">
              <span className="text-lg font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded">
                {supportEmail}
              </span>
              <Button variant="outline" size="sm" onClick={copyEmailToClipboard}>
                {copiedEmail ? "Copied!" : "Copy"}
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">Response time: 24-48 hours</p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">For Account Issues, Please Include:</h3>
            <div className="text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
              <p>• Your registered email address</p>
              <p>• Brief description of the problem</p>
              <p>• When the issue started</p>
              <p>• Any error messages you've seen</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Self-Help */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Before Contacting Support</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Try These First:</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Clear your browser cache and cookies</li>
              <li>• Try using incognito/private mode</li>
              <li>• Check your internet connection</li>
              <li>• Wait 15 minutes and try again</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Common Issues:</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                • <strong>Can't log in:</strong> Check email/password
              </li>
              <li>
                • <strong>Account blocked:</strong> Contact support
              </li>
              <li>
                • <strong>Missing verification:</strong> Check spam folder
              </li>
              <li>
                • <strong>Company access:</strong> Ask your admin
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Back to Login */}
      <div className="text-center">
        <Link href="/login">
          <Button variant="outline" size="lg">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
