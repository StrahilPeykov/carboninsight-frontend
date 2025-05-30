import { Metadata } from "next";

const baseTitle = "CarbonInsight";
const baseDescription =
  "Calculate your product carbon footprint and generate Digital Product Passports";

export function generateMetadata(pageTitle: string, pageDescription?: string): Metadata {
  return {
    title: `${pageTitle} | ${baseTitle}`,
    description: pageDescription || baseDescription,
    openGraph: {
      title: `${pageTitle} | ${baseTitle}`,
      description: pageDescription || baseDescription,
      type: "website",
    },
  };
}

// Usage in pages:
// export const metadata = generateMetadata("Dashboard", "Manage your carbon footprint data");
