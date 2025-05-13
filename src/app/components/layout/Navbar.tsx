"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { ChevronDown, HomeIcon, SettingsIcon, BuildingIcon, LayoutDashboardIcon, Boxes, BarChart } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

  useEffect(() => {
    if (!companyId) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchCompany = async () => {
      try {
        const response = await fetch(`${API_URL}/companies/${companyId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(`Error ${response.status}: ${message}`);
        }

        const data = await response.json();
        setCompanyData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCompany();
  }, [API_URL, router, companyId]);

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

  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    setCompanyId(id);
  }, [router]);

  // Helper function to determine if a navigation item is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white shadow-sm dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
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
                <span className="text-2xl font-bold ml-1">Carbon Insight</span>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu open/close */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                      ${isActive('/dashboard') 
                        ? 'bg-red text-white' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
                  >
                    <LayoutDashboardIcon size={16} className="mr-1" />
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/list-companies"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                      ${isActive('/list-companies') || isActive('/company-details') || isActive('/manage-user')
                        ? 'bg-red text-white' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
                  >
                    <BuildingIcon size={16} className="mr-1" />
                    Companies
                  </Link>
                  
                  <Link
                    href="/product-list"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                      ${isActive('/product-list') 
                        ? 'bg-red text-white' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
                  >
                    <Boxes size={16} className="mr-1" />
                    Products
                  </Link>
                  
                  <Link
                    href="/get-started"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                      ${isActive('/get-started') || isActive('/self-assessment') || isActive('/manufacturing-data') 
                          || isActive('/supply-chain-data') || isActive('/results')
                        ? 'bg-red text-white' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
                  >
                    <BarChart size={16} className="mr-1" />
                    Calculate PCF
                  </Link>
                  
                  <div className="relative ml-3" ref={profileMenuRef}>
                    <div>
                      <button
                        ref={profileButtonRef}
                        onClick={toggleProfileMenu}
                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        id="user-menu"
                        aria-expanded="false"
                        aria-haspopup="true"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                          {user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <ChevronDown size={16} className="ml-1" />
                      </button>
                    </div>
                    {isProfileMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          {companyData.name && (
                            <p className="text-gray-500 dark:text-gray-400 truncate">
                              {companyData.name}
                            </p>
                          )}
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Account Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
      </div>

      {/* Mobile menu, show/hide based on state */}
      <div
        className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`}
      >
        <div className="pt-2 pb-3 space-y-1">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive('/dashboard') 
                    ? 'bg-red text-white' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
              >
                <LayoutDashboardIcon size={16} className="mr-2" />
                Dashboard
              </Link>
              
              <Link
                href="/list-companies"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive('/list-companies') || isActive('/company-details') || isActive('/manage-user')
                    ? 'bg-red text-white' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
              >
                <BuildingIcon size={16} className="mr-2" />
                Companies
              </Link>
              
              <Link
                href="/product-list"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive('/product-list') 
                    ? 'bg-red text-white' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
              >
                <Boxes size={16} className="mr-2" />
                Products
              </Link>
              
              <Link
                href="/get-started"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium 
                  ${isActive('/get-started') || isActive('/self-assessment') || isActive('/manufacturing-data') 
                      || isActive('/supply-chain-data') || isActive('/results')
                    ? 'bg-red text-white' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}`}
              >
                <BarChart size={16} className="mr-2" />
                Calculate PCF
              </Link>
              
              <Link
                href="/account"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                <SettingsIcon size={16} className="mr-2" />
                Account Settings
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
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
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
