"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import { useAuth } from "./context/AuthContext";
import { companyApi } from "@/lib/api/companyApi";
import { Building2, BarChart3, FileText, Share2, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [hasCompanies, setHasCompanies] = useState(false);
  const [checkingCompanies, setCheckingCompanies] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before checking companies
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user has companies when authenticated
  useEffect(() => {
    if (!mounted) return;

    async function checkCompanies() {
      if (!isAuthenticated) {
        setHasCompanies(false);
        return;
      }

      setCheckingCompanies(true);
      try {
        const companies = await companyApi.listCompanies();
        setHasCompanies(companies.length > 0);
      } catch (err) {
        console.error("Error checking companies:", err);
        setHasCompanies(false);
      } finally {
        setCheckingCompanies(false);
      }
    }

    checkCompanies();
  }, [isAuthenticated, mounted]);

  // Determine the right CTA based on user state
  const getCtaButton = () => {
    if (!mounted || !isAuthenticated) {
      return (
        <Link href="/login">
          <Button size="lg">Get Started</Button>
        </Link>
      );
    }

    if (checkingCompanies) {
      return (
        <Button size="lg" disabled>
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
          Loading...
        </Button>
      );
    }

    if (!hasCompanies) {
      return (
        <Link href="/create-company">
          <Button size="lg">Create Your First Company</Button>
        </Link>
      );
    }

    return (
      <Link href="/list-companies">
        <Button size="lg">Go to Dashboard</Button>
      </Link>
    );
  };

  return (
    <div className="py-12 sm:py-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">CarbonInsight</span>
            <span className="block text-red text-3xl sm:text-4xl mt-2">
              Digital Product Passports Made Simple
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
            Calculate your product's carbon footprint across the entire supply chain and generate 
            industry-compliant Digital Product Passports (DPPs) with our intuitive platform. 
            Built for SMEs, designed for simplicity.
          </p>
          
          {/* Fixed button spacing */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="w-full sm:w-auto">
              {getCtaButton()}
            </div>
            <div className="w-full sm:w-auto">
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Value Props */}
      <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Complete Emissions Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track emissions from materials, production, transportation, and product usage in one place
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Industry Standards Compliant</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate DPPs in AAS, SCSN, and other formats required by EU regulations
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get personalized recommendations to reduce your carbon footprint with AI analysis
            </p>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Your Journey to Digital Product Passports
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Follow our step-by-step process to calculate emissions and generate compliant DPPs
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line - Hidden on mobile */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-5xl">
            <div className="relative h-1 bg-gray-200 dark:bg-gray-700">
              <div className="absolute inset-0 bg-gradient-to-r from-red-200 via-red-400 to-red-600 dark:from-red-800 dark:via-red-600 dark:to-red-400"></div>
            </div>
          </div>

          <div className="relative grid gap-8 lg:grid-cols-5">
            {/* Step 1 */}
            <div className="relative">
              <Card className="flex flex-col items-center justify-start text-center p-6 h-full">
                <div className="relative z-10 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  1
                </div>
                <div className="w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Register Company</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create your company profile and invite team members
                </p>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="flex flex-col items-center justify-start text-center p-6 h-full">
                <div className="relative z-10 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  2
                </div>
                <div className="w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Add Products</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter product details and basic information
                </p>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="flex flex-col items-center justify-start text-center p-6 h-full">
                <div className="relative z-10 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  3
                </div>
                <div className="w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                  <Share2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Map Supply Chain</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add materials, energy use, and transportation data
                </p>
              </Card>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <Card className="flex flex-col items-center justify-start text-center p-6 h-full">
                <div className="relative z-10 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  4
                </div>
                <div className="w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">View Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  See detailed emission breakdowns and AI insights
                </p>
              </Card>
            </div>

            {/* Step 5 */}
            <div className="relative">
              <Card className="flex flex-col items-center justify-start text-center p-6 h-full">
                <div className="relative z-10 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  5
                </div>
                <div className="w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Export DPPs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate compliant Digital Product Passports
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Detailed Process Explanation */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8">
            <h3 className="text-2xl font-semibold mb-6 text-center">What Makes CarbonInsight Different?</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <ArrowRight className="h-5 w-5 text-red-600 mr-2" />
                  Comprehensive Data Input
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Bill of Materials tracking</li>
                  <li>• Production energy consumption</li>
                  <li>• Transportation emissions</li>
                  <li>• Product usage energy</li>
                  <li>• Complete lifecycle analysis</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <ArrowRight className="h-5 w-5 text-red-600 mr-2" />
                  Smart Features
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Supply chain data sharing</li>
                  <li>• Default emission factors</li>
                  <li>• Multi-format exports (PDF, AAS, SCSN, Excel)</li>
                  <li>• AI-powered reduction advice</li>
                  <li>• Team collaboration tools</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Built for Modern Manufacturing
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Everything you need to meet sustainability regulations and customer demands
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">For SMEs</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Designed specifically for small and medium enterprises who need professional carbon 
              footprint calculations without the complexity of enterprise software.
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>✓ No technical expertise required</li>
              <li>✓ Guided step-by-step process</li>
              <li>✓ Affordable pricing for SMEs</li>
              <li>✓ Quick onboarding</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Supply Chain Ready</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect with suppliers and customers to share carbon footprint data securely and 
              build complete emission profiles across your value chain.
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>✓ Request data from suppliers</li>
              <li>✓ Share data with customers</li>
              <li>✓ Control data access permissions</li>
              <li>✓ Build complete carbon profiles</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-20 bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Ready to Create Your First Digital Product Passport?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Join forward-thinking companies using CarbonInsight to meet sustainability goals 
            and regulatory requirements.
          </p>
          <div className="mt-8">
            {!isAuthenticated ? (
              <Link href="/register">
                <Button size="lg">Start Free Today</Button>
              </Link>
            ) : (
              getCtaButton()
            )}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 px-4">
        <p>Funded by the European Union • Developed by Brainport Industries & TU Eindhoven</p>
      </div>
    </div>
  );
}