"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import { useAuth } from "./context/AuthContext";
import { companyApi } from "@/lib/api/companyApi";
import { Building2, BarChart3, FileText, Share2, Shield, ArrowRight } from "lucide-react";

/**
 * Home Page Component
 * 
 * This is the main landing page for CarbonInsight that serves different content
 * based on the user's authentication status and company ownership.
 * 
 * Key Features:
 * - Dynamic content based on authentication state
 * - Contextual call-to-action buttons depending on user status
 * - Comprehensive feature overview and benefits
 * - Step-by-step process explanation (5-step workflow)
 * - Responsive design with hero section and feature cards
 * - Company checking to determine appropriate next actions
 * - Progressive enhancement for authenticated users
 * - Marketing content for non-authenticated visitors
 */
export default function Home() {
  const { isAuthenticated } = useAuth();
  
  // State management for user's company status
  const [hasCompanies, setHasCompanies] = useState(false);
  const [checkingCompanies, setCheckingCompanies] = useState(false);
  const [mounted, setMounted] = useState(false);

  /**
   * Ensure component is mounted before checking companies
   * Prevents hydration mismatches between server and client rendering
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Check if authenticated user has companies when component mounts
   * This determines the appropriate call-to-action button to display
   */
  useEffect(() => {
    if (!mounted) return;

    async function checkCompanies() {
      // Skip company check for non-authenticated users
      if (!isAuthenticated) {
        setHasCompanies(false);
        return;
      }

      setCheckingCompanies(true);
      try {
        // Fetch user's companies to determine if they have any
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

  /**
   * Determine the appropriate call-to-action button based on user state
   * Returns different buttons for: non-authenticated, loading, no companies, or has companies
   */
  const getCtaButton = () => {
    // Show login button for non-authenticated users
    if (!mounted || !isAuthenticated) {
      return (
        <Link href="/login">
          <Button size="lg">Get Started</Button>
        </Link>
      );
    }

    // Show loading button while checking company status
    if (checkingCompanies) {
      return (
        <Button size="lg" disabled>
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
          Loading...
        </Button>
      );
    }

    // Show create company button for users without companies
    if (!hasCompanies) {
      return (
        <Link href="/create-company">
          <Button size="lg">Create Your First Company</Button>
        </Link>
      );
    }

    // Show dashboard button for users with existing companies
    return (
      <Link href="/list-companies">
        <Button size="lg">Go to Dashboard</Button>
      </Link>
    );
  };

  return (
    <div className="py-12 sm:py-16">
      {/* Hero Section - Main landing content with value proposition */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main headline with brand name and value proposition */}
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">CarbonInsight</span>
            <span className="block text-red text-3xl sm:text-4xl mt-2">
              Carbon Footprint Calculations Made Simple
            </span>
          </h1>
          
          {/* Detailed value proposition and target audience description */}
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
            Calculate your product's carbon footprint across the entire supply chain and generate
            industry-compliant Carbon Footprint Reports. Designed for manufacturers who want to
            lead in sustainability.
          </p>

          {/* Call-to-action buttons with primary and secondary actions */}
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

      {/* Key Benefits Section - Three main value propositions */}
      <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Complete Carbon Analysis Benefit */}
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

          {/* Regulatory Compliance Benefit */}
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Regulatory Compliance</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate Carbon Footprint Reports that meet EU regulations and industry standards including AAS and SCSN
            </p>
          </Card>

          {/* Supply Chain Collaboration Benefit */}
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

      {/* How It Works Section - 5-step process explanation */}
      <div id="how-it-works" className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            From Setup to Carbon Footprint Report in 5 Steps
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Our guided process makes carbon footprint calculation straightforward
          </p>
        </div>

        {/* Process Steps with Visual Connection Line */}
        <div className="relative">
          {/* Connection Line - Hidden on mobile devices for better responsive design */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-5xl">
            <div className="relative h-1 bg-gray-200 dark:bg-gray-700">
              <div className="absolute inset-0 bg-gradient-to-r from-red-200 via-red-400 to-red-600 dark:from-red-800 dark:via-red-600 dark:to-red-400"></div>
            </div>
          </div>

          {/* Five-step process grid */}
          <div className="relative grid gap-8 lg:grid-cols-5">
            {/* Step 1: Create Company */}
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

            {/* Step 2: Add Products */}
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

            {/* Step 3: Input Data */}
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

            {/* Step 4: Analyze Results */}
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

            {/* Step 5: Export Report */}
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

      {/* Complete Lifecycle Coverage Section - Detailed feature explanation */}
      <div className="mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Everything You Need for Carbon Transparency
          </h2>

          {/* Overview paragraph */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            CarbonInsight provides a complete solution for understanding and optimizing your
            product's environmental impact. From raw materials to end-of-life, get the insights you
            need.
          </p>

          {/* Two-column feature grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Comprehensive Data Tracking Feature */}
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

              {/* AI-Powered Optimization Feature */}
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
              {/* Supply Chain Integration Feature */}
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

              {/* Export Flexibility Feature */}
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

          {/* Target audience and positioning statement */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built for SMEs • Designed for simplicity • Ready for regulations
            </p>
          </div>
        </Card>
      </div>

      {/* Final Call-to-Action Section */}
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
            {/* Dynamic CTA button based on authentication status */}
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
