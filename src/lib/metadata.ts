/**
 * Metadata generation utilities for Next.js pages
 * Provides consistent SEO metadata across the application
 */

import { Metadata } from "next";

// Base application metadata constants
const baseTitle = "CarbonInsight";
const baseDescription =
  "Calculate your product carbon footprint and generate Carbon Footprint Reports";

/**
 * Generate consistent metadata for pages throughout the application
 * Combines page-specific title and description with base app metadata
 * 
 * @param pageTitle - Specific title for the page
 * @param pageDescription - Optional description for the page, falls back to base description
 * @returns Complete metadata object for Next.js pages
 */
export function generateMetadata(pageTitle: string, pageDescription?: string): Metadata {
  return {
    // Combine page title with app name for browser tab
    title: `${pageTitle} | ${baseTitle}`,
    // Use page description or fall back to base description
    description: pageDescription || baseDescription,
    // Open Graph metadata for social media sharing
    openGraph: {
      title: `${pageTitle} | ${baseTitle}`,
      description: pageDescription || baseDescription,
      type: "website",
    },
  };
}

// Usage example in pages:
// export const metadata = generateMetadata("Dashboard", "Manage your carbon footprint data");
