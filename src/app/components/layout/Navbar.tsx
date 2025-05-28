"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import {
  ChevronDown,
  SettingsIcon,
  BuildingIcon,
  LayoutDashboardIcon,
  Boxes,
  HelpCircle,
} from "lucide-react";
import { companyApi } from "@/lib/api/companyApi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  const [companyDataLoading, setCompanyDataLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Keyboard navigation for dropdown
  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProfileMenuOpen]);

  // Get companyId from localStorage and listen for changes
  useEffect(() => {
    if (!mounted) return;

    // Initial load
    const id = typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
    setCompanyId(id);

    // Listen for storage changes (when localStorage is updated from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selected_company_id") {
        setCompanyId(e.newValue);
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleCompanyChange = () => {
      const id = localStorage.getItem("selected_company_id");
      setCompanyId(id);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("companyChanged", handleCompanyChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("companyChanged", handleCompanyChange);
    };
  }, [mounted]);

  // Only fetch company data when authentication is confirmed and companyId is available
  useEffect(() => {
    if (!mounted || !isAuthenticated || !companyId || isLoading) {
      // Clear company data if no company is selected
      if (!companyId) {
        setCompanyData({
          name: "",
          vat_number: "",
          business_registration_number: "",
        });
      }
      return;
    }

    const fetchCompany = async () => {
      setCompanyDataLoading(true);
      setCompanyError(null);
      try {
        const data = await companyApi.getCompany(companyId);
        setCompanyData(data);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setCompanyError(err instanceof Error ? err.message : "Failed to load company data");
        // Clear the invalid company ID
        if (typeof window !== "undefined") {
          localStorage.removeItem("selected_company_id");
        }
        setCompanyId(null);
      } finally {
        setCompanyDataLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, isAuthenticated, isLoading, mounted]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    // Add event listener only when dropdown is open
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Helper function to determine if a navigation item is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  // Determine what navigation items to show based on auth and company selection state
  const showCompanySpecificItems = mounted && isAuthenticated && companyId && !companyError;

  return (
    <nav
      className="sticky top-0 z-50 h-16 bg-white shadow-sm dark:bg-gray-900"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/brainport-logo-white.webp"
                alt="Carbon Footprint Calculator"
                width={32}
                height={32}
                className="hidden dark:block"
              />
              <Image
                src="/brainport-logo.webp"
                alt="Carbon Footprint Calculator"
                width={32}
                height={32}
                className="block dark:hidden"
              />
              <span className="text-xl font-bold ml-1 mr-4">Carbon Insight</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <span className="sr-only">{isMenuOpen ? "Close main menu" : "Open main menu"}</span>
              {/* Icon for menu open/close */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Desktop menu - Fixed spacing issues */}
          <div className="hidden sm:flex sm:items-center sm:space-x-1 lg:space-x-4">
            {isAuthenticated && mounted ? (
              <>
                {/* Dashboard - Only show when company is selected */}
                {showCompanySpecificItems && (
                  <Link
                    href="/dashboard"
                    className={`flex items-center px-2 lg:px-3 py-2 rounded-md text-sm font-medium 
                      ${
                        isActive("/dashboard")
                          ? "bg-red text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                      }`}
                    aria-current={isActive("/dashboard") ? "page" : undefined}
                  >
                    <LayoutDashboardIcon size={16} className="mr-1" aria-hidden="true" />
                    Dashboard
                  </Link>
                )}

                {/* Companies - Always show for authenticated users */}
                <Link
                  href="/list-companies"
                  className={`flex items-center px-2 lg:px-3 py-2 rounded-md text-sm font-medium 
                    ${
                      isActive("/list-companies") ||
                      isActive("/company-details") ||
                      isActive("/manage-user") ||
                      isActive("/product-data-sharing")
                        ? "bg-red text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    }`}
                  aria-current={isActive("/list-companies") ? "page" : undefined}
                >
                  <BuildingIcon size={16} className="mr-1" aria-hidden="true" />
                  Companies
                </Link>

                {/* Products - Only show when company is selected */}
                {showCompanySpecificItems && (
                  <Link
                    href="/product-list"
                    className={`flex items-center px-2 lg:px-3 py-2 rounded-md text-sm font-medium 
                      ${
                        isActive("/product-list")
                          ? "bg-red text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                      }`}
                    aria-current={isActive("/product-list") ? "page" : undefined}
                  >
                    <Boxes size={16} className="mr-1" aria-hidden="true" />
                    Products
                  </Link>
                )}

                <div className="relative ml-3" ref={profileMenuRef}>
                  <div>
                    <button
                      ref={profileButtonRef}
                      onClick={toggleProfileMenu}
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      id="user-menu-button"
                      aria-expanded={isProfileMenuOpen}
                      aria-haspopup="true"
                      aria-label="User account menu"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                        <span aria-hidden="true">
                          {user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <ChevronDown size={16} className="ml-1" aria-hidden="true" />
                    </button>
                  </div>
                  {isProfileMenuOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        {companyDataLoading ? (
                          <p className="text-gray-500 dark:text-gray-400">
                            <span className="sr-only">Loading company information</span>
                            Loading company...
                          </p>
                        ) : companyError ? (
                          <p className="text-red-500 truncate">Select a company</p>
                        ) : companyData.name ? (
                          <p className="text-gray-500 dark:text-gray-400 truncate">
                            {companyData.name}
                          </p>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No company selected</p>
                        )}
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                          role="menuitem"
                        >
                          Account Settings
                        </Link>
                        {companyId && !companyError && (
                          <Link
                            href="/company-details"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileMenuOpen(false)}
                            role="menuitem"
                          >
                            Company Details
                          </Link>
                        )}
                        <Link
                          href="/support"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                          role="menuitem"
                        >
                          Support & Help
                        </Link>
                      </div>
                      <Link
                        href="/list-companies"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          // Clear the selected company when switching
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("selected_company_id");
                            window.dispatchEvent(new CustomEvent("companyChanged"));
                          }
                        }}
                        role="menuitem"
                      >
                        {companyId && !companyError ? "Switch company" : "Select company"}
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/register" className="py-2 rounded-md text-sm font-bold">
                  <Button size="md">Register</Button>
                </Link>
                <Link href="/login" className="py-2 rounded-md text-sm font-bold">
                  <Button size="md">Login</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on state */}
      <div
        className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="pt-2 pb-3 space-y-1">
          {isAuthenticated && mounted ? (
            <>
              {/* Dashboard - Only show when company is selected */}
              {showCompanySpecificItems && (
                <Link
                  href="/dashboard"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                    ${
                      isActive("/dashboard")
                        ? "bg-red text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                >
                  <LayoutDashboardIcon size={16} className="mr-2" aria-hidden="true" />
                  Dashboard
                </Link>
              )}

              {/* Companies - Always show for authenticated users */}
              <Link
                href="/list-companies"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${
                    isActive("/list-companies") ||
                    isActive("/company-details") ||
                    isActive("/manage-user") ||
                    isActive("/product-data-sharing")
                      ? "bg-red text-white"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive("/list-companies") ? "page" : undefined}
              >
                <BuildingIcon size={16} className="mr-2" aria-hidden="true" />
                Companies
              </Link>

              {/* Products - Only show when company is selected */}
              {showCompanySpecificItems && (
                <Link
                  href="/product-list"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                    ${
                      isActive("/product-list")
                        ? "bg-red text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive("/product-list") ? "page" : undefined}
                >
                  <Boxes size={16} className="mr-2" aria-hidden="true" />
                  Products
                </Link>
              )}

              <Link
                href="/account"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <SettingsIcon size={16} className="mr-2" aria-hidden="true" />
                Account Settings
              </Link>
              {companyId && !companyError && (
                <Link
                  href="/company-details"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Company details
                </Link>
              )}
              <Link
                href="/support"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <HelpCircle size={16} className="mr-2" aria-hidden="true" />
                Support & Help
              </Link>
              <Link
                href="/list-companies"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsMenuOpen(false);
                  // Clear the selected company when switching
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("selected_company_id");
                    window.dispatchEvent(new CustomEvent("companyChanged"));
                  }
                }}
              >
                {companyId && !companyError ? "Switch company" : "Select company"}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
