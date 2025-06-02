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
  ChevronRight,
  Building2,
  Plus,
  Settings,
} from "lucide-react";
import { companyApi } from "@/lib/api/companyApi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const companyMenuRef = useRef<HTMLDivElement>(null);
  const companyButtonRef = useRef<HTMLButtonElement>(null);
  
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  const [allCompanies, setAllCompanies] = useState<Array<{id: string, name: string}>>([]);
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
    setIsCompanyMenuOpen(false);
  };

  const toggleCompanyMenu = () => {
    setIsCompanyMenuOpen(!isCompanyMenuOpen);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear all company-related data on logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("selected_company_id");
      localStorage.removeItem("currentAssessmentId");
    }
    setCompanyId(null);
    setCompanyData({
      name: "",
      vat_number: "",
      business_registration_number: "",
    });
    setCompanyError(null);
    logout();
    router.push("/");
  };

  // Helper function to clear company data completely
  const clearCompanyData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("selected_company_id");
      window.dispatchEvent(new CustomEvent("companyChanged"));
    }
    setCompanyId(null);
    setCompanyData({
      name: "",
      vat_number: "",
      business_registration_number: "",
    });
    setCompanyError(null);
  };

  // Get companyId from localStorage and listen for changes
  useEffect(() => {
    if (!mounted) return;

    const id = typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
    setCompanyId(id);

    // Refetch companies list (for when companies are added/deleted)
    const refetchCompanies = async () => {
      if (!isAuthenticated || isLoading) return;
      
      try {
        const companies = await companyApi.listCompanies();
        setAllCompanies(companies);
        
        // If current company is no longer in the list, clear it
        const currentId = localStorage.getItem("selected_company_id");
        if (currentId && !companies.find(c => c.id === currentId)) {
          clearCompanyData();
        }
      } catch (err) {
        console.error("Error refetching companies:", err);
        setAllCompanies([]);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selected_company_id") {
        setCompanyId(e.newValue);
      }
    };

    const handleCompanyChange = () => {
      const id = localStorage.getItem("selected_company_id");
      setCompanyId(id);
    };

    // Listen for company deletions/additions
    const handleCompanyListChange = () => {
      console.log("Company list changed event received - refetching companies");
      refetchCompanies();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("companyChanged", handleCompanyChange);
    window.addEventListener("companyListChanged", handleCompanyListChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("companyChanged", handleCompanyChange);
      window.removeEventListener("companyListChanged", handleCompanyListChange);
    };
  }, [mounted, isAuthenticated, isLoading]);

  // Clear company data when user changes or becomes unauthenticated
  useEffect(() => {
    if (!isAuthenticated && mounted) {
      clearCompanyData();
    }
  }, [isAuthenticated, mounted]);

  // Fetch companies list and selected company data
  useEffect(() => {
    if (!mounted || !isAuthenticated || isLoading) return;

    const fetchData = async () => {
      try {
        // Always fetch the list of companies the user has access to
        const companies = await companyApi.listCompanies();
        setAllCompanies(companies);

        // If a company is selected, fetch its details
        if (companyId) {
          setCompanyDataLoading(true);
          try {
            const data = await companyApi.getCompany(companyId);
            setCompanyData(data);
            setCompanyError(null);
          } catch (err) {
            console.error("Error fetching company data:", err);
            setCompanyError("Invalid company selection");
            clearCompanyData();
          } finally {
            setCompanyDataLoading(false);
          }
        } else {
          setCompanyData({
            name: "",
            vat_number: "",
            business_registration_number: "",
          });
          setCompanyError(null);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setAllCompanies([]);
      }
    };

    fetchData();
  }, [companyId, isAuthenticated, isLoading, mounted]);

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
      
      if (
        isCompanyMenuOpen &&
        companyMenuRef.current &&
        companyButtonRef.current &&
        !companyMenuRef.current.contains(event.target as Node) &&
        !companyButtonRef.current.contains(event.target as Node)
      ) {
        setIsCompanyMenuOpen(false);
      }
    }

    if (isProfileMenuOpen || isCompanyMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen, isCompanyMenuOpen]);

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

  // Handle company selection
  const handleCompanySelect = (selectedCompanyId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_company_id", selectedCompanyId);
      window.dispatchEvent(new CustomEvent("companyChanged"));
    }
    setIsCompanyMenuOpen(false);
    
    // Redirect to dashboard when company is selected
    if (pathname === "/list-companies" || pathname === "/") {
      router.push("/dashboard");
    }
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const breadcrumbs = [];

    if (isAuthenticated) {
      if (pathname === '/list-companies' || pathname === '/create-company') {
        breadcrumbs.push({ label: 'Companies', href: '/list-companies', active: pathname === '/list-companies', key: 'companies' });
        if (pathname === '/create-company') {
          breadcrumbs.push({ label: 'Create Company', href: '/create-company', active: true, key: 'create-company' });
        }
      } else if (companyData.name) {
        breadcrumbs.push({ label: companyData.name, href: '/dashboard', active: false, key: 'company-name' });
        
        if (pathname === '/dashboard') {
          breadcrumbs.push({ label: 'Dashboard', href: '/dashboard', active: true, key: 'dashboard' });
        } else if (pathname.startsWith('/product-list')) {
          breadcrumbs.push({ label: 'Products', href: '/product-list', active: pathname === '/product-list', key: 'products' });
        } else if (pathname.startsWith('/company-details')) {
          breadcrumbs.push({ label: 'Settings', href: '/company-details', active: true, key: 'company-settings' });
        } else if (pathname.startsWith('/manage-user')) {
          breadcrumbs.push({ label: 'Users', href: '/manage-user', active: true, key: 'users' });
        }
      } else if (pathname.startsWith('/account')) {
        breadcrumbs.push({ label: 'Account', href: '/account', active: true, key: 'account' });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <>
      <nav
        className="sticky top-0 z-50 h-16 bg-white shadow-sm dark:bg-gray-900"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                href={isAuthenticated ? (companyId ? "/dashboard" : "/list-companies") : "/"}
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

            {/* Desktop menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated && mounted ? (
                <>
                  {/* Main Navigation */}
                  <nav className="flex items-center space-x-1" role="navigation">
                    <Link
                      href="/list-companies"
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium min-h-[44px]
                        ${
                          isActive("/list-companies") || isActive("/create-company")
                            ? "bg-red text-white"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                        }`}
                      aria-current={isActive("/list-companies") ? "page" : undefined}
                    >
                      <BuildingIcon size={16} className="mr-1" aria-hidden="true" />
                      Companies
                    </Link>

                    {/* Only show Dashboard and Products when a company is selected */}
                    {companyId && !companyError && (
                      <>
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
                      </>
                    )}
                  </nav>

                  {/* Company Selector (when companies exist) */}
                  {allCompanies.length > 0 && (
                    <div className="relative ml-4" ref={companyMenuRef}>
                      <button
                        ref={companyButtonRef}
                        onClick={toggleCompanyMenu}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium min-h-[44px] max-w-48 border
                          ${companyId && !companyError 
                            ? "bg-red text-white border-red" 
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                          }`}
                        aria-expanded={isCompanyMenuOpen}
                        aria-haspopup="true"
                        aria-label={`Current company: ${companyData.name || "None selected"}`}
                      >
                        <Building2 size={16} className="mr-2 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {companyDataLoading ? "Loading..." : companyData.name || "Select Company"}
                        </span>
                        <ChevronDown size={16} className="ml-2 flex-shrink-0" aria-hidden="true" />
                      </button>

                      {isCompanyMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 max-h-64 overflow-y-auto">
                          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            Select Company:
                          </div>
                          {allCompanies.map((company) => (
                            <button
                              key={company.id}
                              onClick={() => handleCompanySelect(company.id)}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] ${
                                company.id === companyId
                                  ? "bg-gray-50 dark:bg-gray-700 font-medium"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center">
                                <Building2 size={14} className="mr-2 flex-shrink-0" />
                                <span className="truncate">{company.name}</span>
                                {company.id === companyId && (
                                  <span className="ml-auto text-red text-xs">•</span>
                                )}
                              </div>
                            </button>
                          ))}
                          
                          {/* Company Actions */}
                          {companyId && !companyError && (
                            <>
                              <div className="border-t border-gray-200 dark:border-gray-700">
                                <Link
                                  href="/company-details"
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px]"
                                  onClick={() => setIsCompanyMenuOpen(false)}
                                >
                                  <Settings size={14} className="mr-2" />
                                  Company Settings
                                </Link>
                                <Link
                                  href="/manage-user"
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px]"
                                  onClick={() => setIsCompanyMenuOpen(false)}
                                >
                                  <HelpCircle size={14} className="mr-2" />
                                  Manage Users
                                </Link>
                              </div>
                            </>
                          )}
                          
                          <div className="border-t border-gray-200 dark:border-gray-700">
                            <Link
                              href="/create-company"
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px]"
                              onClick={() => setIsCompanyMenuOpen(false)}
                            >
                              <Plus size={14} className="mr-2" />
                              Create New Company
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Menu */}
                  <div className="relative ml-3" ref={profileMenuRef}>
                    <button
                      ref={profileButtonRef}
                      onClick={toggleProfileMenu}
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red min-h-[44px] p-2"
                      id="user-menu-button"
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
        <div
          className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`}
          id="mobile-menu"
        >
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated && mounted ? (
              <>
                <Link
                  href="/list-companies"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium min-h-[44px]
                    ${
                      isActive("/list-companies") || isActive("/create-company")
                        ? "bg-red text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BuildingIcon size={16} className="mr-2" aria-hidden="true" />
                  Companies
                </Link>

                {companyId && !companyError && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium min-h-[44px]
                        ${
                          isActive("/dashboard")
                            ? "bg-red text-white"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboardIcon size={16} className="mr-2" aria-hidden="true" />
                      Dashboard
                    </Link>

                    <Link
                      href="/product-list"
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium min-h-[44px]
                        ${
                          isActive("/product-list")
                            ? "bg-red text-white"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Boxes size={16} className="mr-2" aria-hidden="true" />
                      Products
                    </Link>
                  </>
                )}

                {/* Mobile Company Selection */}
                {allCompanies.length > 0 && (
                  <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Company:</p>
                    <select
                      value={companyId || ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleCompanySelect(e.target.value);
                        } else {
                          clearCompanyData();
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
                    
                    {companyId && !companyError && (
                      <div className="mt-3 space-y-1">
                        <Link
                          href="/company-details"
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings size={14} className="mr-2" />
                          Company Settings
                        </Link>
                        <Link
                          href="/manage-user"
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <HelpCircle size={14} className="mr-2" />
                          Manage Users
                        </Link>
                      </div>
                    )}
                    
                    <Link
                      href="/create-company"
                      className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus size={14} className="mr-1" />
                      Create New Company
                    </Link>
                  </div>
                )}

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

      {/* Breadcrumb Navigation */}
      {isAuthenticated && breadcrumbs.length > 0 && (
        <nav 
          className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          aria-label="Breadcrumb"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center space-x-2 py-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.key} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight size={14} className="text-gray-400 mr-2" aria-hidden="true" />
                  )}
                  {crumb.active ? (
                    <span className="text-gray-900 dark:text-white font-medium" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </>
  );
}
