"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import { useAuth } from "./context/AuthContext";
import { companyApi } from "@/lib/api/companyApi";
import { Building2, BarChart3, FileText, Share2, Shield, ArrowRight } from "lucide-react";

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
              Carbon Footprint Calculations Made Simple
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
            Calculate your product's carbon footprint across the entire supply chain and generate
            industry-compliant Carbon Footprint Report. Designed for manufacturers who want to
            lead in sustainability.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="w-full sm:w-auto">{getCtaButton()}</div>
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

      {/* Key Benefits */}
      <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Complete Carbon Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track emissions from materials, production, transportation, and usage in one
              integrated platform
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Regulatory Compliance</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate Carbon Footprint Reports that meet EU regulations and industry standards including AAS and SCSN
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Supply Chain Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Securely share and request emission data across your value chain for complete
              transparency
            </p>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            From Setup to Carbon Footprint Report in 5 Steps
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Our guided process makes carbon footprint calculation straightforward
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Create Company
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set up your company profile and invite team members
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Add Products
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your product information and specifications
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Input Data
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add materials, energy, and transportation data
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Analyze Results
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review emissions breakdown and AI recommendations
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Export Carbon Footprint Report
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate your Carbon Footprint Report
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Lifecycle Coverage */}
      <div className="mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Everything You Need for Carbon Transparency
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            CarbonInsight provides a complete solution for understanding and optimizing your
            product's environmental impact. From raw materials to end-of-life, get the insights you
            need.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <ArrowRight className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Comprehensive Data Tracking
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Capture every aspect of your product's lifecycle - from bill of materials and
                    production energy to transportation routes and usage patterns. Our platform
                    adapts to your specific manufacturing processes.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <ArrowRight className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    AI-Powered Optimization
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Get personalized recommendations for reducing your carbon footprint. Our AI
                    analyzes your specific data to identify practical improvements that make both
                    environmental and business sense.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <ArrowRight className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Supply Chain Integration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Connect with suppliers and customers to build complete emission profiles.
                    Request data, share results, and collaborate on sustainability goals while
                    maintaining full control over your information.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <ArrowRight className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Export in Any Format
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Generate Carbon Footprint Reports that meet your needs - whether it's AAS for
                    technical integration, SCSN for supply chain partners, or traditional PDFs and
                    spreadsheets for reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built for SMEs • Designed for simplicity • Ready for regulations
            </p>
          </div>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="mt-20 py-16 mb-12">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Ready to Start Your Sustainability Journey?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Join forward-thinking manufacturers using CarbonInsight to meet sustainability goals and
            stay ahead of regulations.
          </p>
          <div className="mt-8">
            {!isAuthenticated ? (
              <Link href="/register">
                <Button size="lg">Create Free Account</Button>
              </Link>
            ) : (
              getCtaButton()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
