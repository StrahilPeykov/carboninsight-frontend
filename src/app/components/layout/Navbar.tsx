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
  LayoutDashboardIcon,
  Boxes,
  HelpCircle,
  Plus,
  Users,
} from "lucide-react";
import { companyApi } from "@/lib/api/companyApi";
import { setLocalStorageItem } from "@/lib/api/apiClient";
import CleanCompanySelector from "./CompanySelector";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  const [allCompanies, setAllCompanies] = useState<Array<{id: string, name: string}>>([]);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (!isProfileMenuOpen) setIsCompanyMenuOpen(false); // Close company menu when opening profile
  };

  const toggleCompanyMenu = () => {
    setIsCompanyMenuOpen(!isCompanyMenuOpen);
    if (!isCompanyMenuOpen) setIsProfileMenuOpen(false); // Close profile menu when opening company
  };

  // Close dropdowns when clicking outside
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

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("selected_company_id");
      localStorage.removeItem("currentAssessmentId");
      localStorage.removeItem("recent_companies");
    }
    setCompanyId(null);
    setCompanyData({ name: "", vat_number: "", business_registration_number: "" });
    logout();
    router.push("/");
  };

  // Get companyId from localStorage and listen for changes
  useEffect(() => {
    if (!mounted) return;

    const id = typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
    setCompanyId(id);

    const handleCompanyChange = (event: Event) => {
      console.log("Company change event received in navbar");
      const id = localStorage.getItem("selected_company_id");
      setCompanyId(id);
      
      // Force re-fetch of company data
      if (id && isAuthenticated && !isLoading) {
        fetchCompanyData(id);
      }
    };

    const handleCompanyListChange = (event: Event) => {
      console.log("Company list change event received in navbar");
      // Refetch the companies list
      if (isAuthenticated && !isLoading) {
        fetchAllCompanies();
      }
    };

    window.addEventListener("companyChanged", handleCompanyChange);
    window.addEventListener("companyListChanged", handleCompanyListChange);
    
    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
      window.removeEventListener("companyListChanged", handleCompanyListChange);
    };
  }, [mounted, isAuthenticated, isLoading]);

  // Helper functions
  const fetchCompanyData = async (companyId: string) => {
    try {
      const data = await companyApi.getCompany(companyId);
      setCompanyData(data);
    } catch (err) {
      console.error("Error fetching company data:", err);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const companies = await companyApi.listCompanies();
      setAllCompanies(companies);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setAllCompanies([]);
    }
  };

  // Fetch companies list and selected company data
  useEffect(() => {
    if (!mounted || !isAuthenticated || isLoading) return;

    const fetchData = async () => {
      try {
        await fetchAllCompanies();

        if (companyId) {
          await fetchCompanyData(companyId);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setAllCompanies([]);
      }
    };

    fetchData();
  }, [companyId, isAuthenticated, isLoading, mounted]);

  // Helper function to determine if a navigation item is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  // Format user display name
  const getUserDisplayName = () => {
    if (!user) return "User";
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    } else {
      return user.username;
    }
  };

  // Enhanced company selector handlers
  const handleCompanySelect = (selectedCompanyId: string) => {
    console.log("Company selection started:", selectedCompanyId);
    
    setLocalStorageItem("selected_company_id", selectedCompanyId);
    
    // Force a state update first
    setCompanyId(selectedCompanyId);
    
    // Dispatch events with slight delays to ensure proper order
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("companyListChanged"));
      }, 10);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("companyChanged"));
      }, 20);
      
      console.log("Company selection events dispatched for:", selectedCompanyId);
    }
    
    // Don't force redirect - let user stay on current page
    // Only redirect if they're on a page that requires no company (like list-companies)
    if (pathname === "/list-companies" || (!companyId && pathname === "/")) {
      router.push("/dashboard");
    }
  };

  const handleCreateCompany = () => {
    router.push("/create-company");
  };

  const handleCompanySettings = () => {
    if (companyId) {
      // Ensure the selected company is set before navigating
      setLocalStorageItem("selected_company_id", companyId);
      router.push("/company-details");
    }
  };

  const handleManageUsers = () => {
    if (companyId) {
      // Ensure the selected company is set before navigating
      setLocalStorageItem("selected_company_id", companyId);
      router.push("/manage-user");
    }
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 h-16 bg-white shadow-sm dark:bg-gray-900"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and brand - FIXED: Always go to home page */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded-md"
                aria-label="CarbonInsight - Home"
              >
                <Image
                  src="/brainport-logo-white.webp"
                  alt=""
                  width={32}
                  height={32}
                  className="hidden dark:block"
                />
                <Image
                  src="/brainport-logo.webp"
                  alt=""
                  width={32}
                  height={32}
                  className="block dark:hidden"
                />
                <span className="text-xl font-bold ml-1 mr-4">CarbonInsight</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red min-w-[44px] min-h-[44px]"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                <span className="sr-only">{isMenuOpen ? "Close main menu" : "Open main menu"}</span>
                {/* Hamburger/X icon */}
                <svg className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated && mounted ? (
                <>
                  {/* Main Navigation - Only show Dashboard and Products when company is selected */}
                  {companyId && (
                    <nav className="flex items-center space-x-1" role="navigation">
                      <Link
                        href="/dashboard"
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium min-h-[44px]
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

                      <Link
                        href="/product-list"
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium min-h-[44px]
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
                    </nav>
                  )}

                  {/* Clean Company Selector */}
                  <CleanCompanySelector
                    companies={allCompanies}
                    currentCompanyId={companyId}
                    onCompanySelect={handleCompanySelect}
                    onCreateCompany={handleCreateCompany}
                    onCompanySettings={handleCompanySettings}
                    onManageUsers={handleManageUsers}
                    isOpen={isCompanyMenuOpen}
                    onToggle={toggleCompanyMenu}
                    onClose={() => setIsCompanyMenuOpen(false)}
                  />

                  {/* Profile Menu */}
                  <div className="relative ml-3" ref={profileMenuRef}>
                    <button
                      ref={profileButtonRef}
                      onClick={toggleProfileMenu}
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red min-h-[44px] p-2"
                      aria-expanded={isProfileMenuOpen}
                      aria-haspopup="true"
                      aria-label={`User account menu for ${getUserDisplayName()}`}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                        <span aria-hidden="true">
                          {user?.first_name?.charAt(0)?.toUpperCase() || 
                           user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <ChevronDown size={16} className="ml-1" aria-hidden="true" />
                    </button>

                    {isProfileMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-medium">{getUserDisplayName()}</p>
                          <p className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px] flex items-center"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <SettingsIcon size={16} className="mr-2" aria-hidden="true" />
                          Account Settings
                        </Link>
                        
                        <Link
                          href="/support"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px] flex items-center"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <HelpCircle size={16} className="mr-2" aria-hidden="true" />
                          Support & Help
                        </Link>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              handleLogout();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px]"
                          >
                            Sign out
                          </button>
                        </div>
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

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`}>
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated && mounted ? (
              <>
                {/* Only show main nav when company is selected */}
                {companyId && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium min-h-[44px]
                        ${isActive("/dashboard") ? "bg-red text-white" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboardIcon size={16} className="mr-2" aria-hidden="true" />
                      Dashboard
                    </Link>

                    <Link
                      href="/product-list"
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium min-h-[44px]
                        ${isActive("/product-list") ? "bg-red text-white" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Boxes size={16} className="mr-2" aria-hidden="true" />
                      Products
                    </Link>
                  </>
                )}

                {/* Mobile Company Selection */}
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Company:</p>
                  <select
                    value={companyId || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleCompanySelect(e.target.value);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select Company</option>
                    {allCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Mobile company actions */}
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => {
                        handleCreateCompany();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-sm text-green-600 hover:text-green-900 py-1"
                    >
                      <Plus size={14} className="mr-1" />
                      Create New Company
                    </button>
                    
                    {companyId && (
                      <>
                        <button
                          onClick={() => {
                            handleCompanySettings();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1"
                        >
                          <SettingsIcon size={14} className="mr-2" />
                          Company Settings
                        </button>
                        <button
                          onClick={() => {
                            handleManageUsers();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1"
                        >
                          <Users size={14} className="mr-2" />
                          Manage Users
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile profile menu */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <Link
                    href="/account"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <SettingsIcon size={16} className="mr-2" aria-hidden="true" />
                    Account Settings
                  </Link>
                  
                  <Link
                    href="/support"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle size={16} className="mr-2" aria-hidden="true" />
                    Support & Help
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
