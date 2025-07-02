"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNavbarState } from "./useNavbarState";
import { setLocalStorageItem } from "@/lib/api/apiClient";
import NavbarMobile from "./NavbarMobile";
import NavbarDesktop from "./NavbarDesktop";

export default function Navbar() {
  const router = useRouter();
  const navbarState = useNavbarState();

  const {
    isMenuOpen,
    isProfileMenuOpen,
    isCompanyMenuOpen,
    companyId,
    allCompanies,
    mounted,
    user,
    isAuthenticated,
    isLoading,
    pathname,
    toggleMenu,
    toggleProfileMenu,
    toggleCompanyMenu,
    handleLogout,
    setIsMenuOpen,
    setIsProfileMenuOpen,
    setIsCompanyMenuOpen,
    isActive,
    getUserDisplayName,
  } = navbarState;

  const handleCreateCompany = () => {
    const activeTour = sessionStorage.getItem("activeTour");
    if (activeTour === "main-onboarding") {
      window.dispatchEvent(
        new CustomEvent("tourAction", {
          detail: { action: "navigate-to-create-company" },
        })
      );
    }
    router.push("/create-company");
  };

  const handleNavigation = (path: string, tourAction?: string) => {
    const activeTour = sessionStorage.getItem("activeTour");
    if (activeTour && tourAction) {
      window.dispatchEvent(
        new CustomEvent("tourAction", {
          detail: { action: tourAction },
        })
      );
    }
    router.push(path);
  };

  const handleCompanySelect = (selectedCompanyId: string) => {
    setLocalStorageItem("selected_company_id", selectedCompanyId);

    // Dispatch events with slight delays to ensure proper order
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("companyListChanged"));
      }, 10);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("companyChanged"));
      }, 20);
    }

    // Redirect logic
    if (pathname === "/list-companies" || (!companyId && pathname === "/")) {
      router.push("/dashboard");
    }
  };

  const handleCompanySettings = () => {
    if (companyId) {
      setLocalStorageItem("selected_company_id", companyId);
      router.push("/company-details");
    }
  };

  const handleManageUsers = () => {
    if (companyId) {
      setLocalStorageItem("selected_company_id", companyId);
      router.push("/manage-user");
    }
  };

  const handleDataSharing = () => {
    if (companyId) {
      setLocalStorageItem("selected_company_id", companyId);
      router.push("/product-data-sharing");
    }
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 h-16 bg-white shadow-sm dark:bg-gray-900"
        role="navigation"
        aria-label="Main navigation"
        id="main-navigation"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo and brand */}
            <div className="flex-shrink-0 flex items-center min-w-0">
              <Link
                href="/"
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded-md pr-2 sm:pr-4"
                aria-label="CarbonInsight - Home"
              >
                <Image
                  src="/brainport-logo-white.webp"
                  alt="CarbonInsight"
                  width={32}
                  height={32}
                  className="hidden dark:block flex-shrink-0"
                />
                <Image
                  src="/brainport-logo.webp"
                  alt="CarbonInsight"
                  width={32}
                  height={32}
                  className="block dark:hidden flex-shrink-0"
                />
                <span className="text-lg sm:text-xl font-bold truncate">
                  <span className="sm:hidden">CI</span>
                  <span className="hidden sm:inline">CarbonInsight</span>
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
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
            <NavbarDesktop
              isAuthenticated={isAuthenticated}
              mounted={mounted}
              companyId={companyId}
              allCompanies={allCompanies}
              isCompanyMenuOpen={isCompanyMenuOpen}
              isProfileMenuOpen={isProfileMenuOpen}
              user={user}
              isActive={isActive}
              onToggleCompanyMenu={toggleCompanyMenu}
              onToggleProfileMenu={toggleProfileMenu}
              onCloseCompanyMenu={() => setIsCompanyMenuOpen(false)}
              onCloseProfileMenu={() => setIsProfileMenuOpen(false)}
              onCompanySelect={handleCompanySelect}
              onCreateCompany={handleCreateCompany}
              onCompanySettings={handleCompanySettings}
              onManageUsers={handleManageUsers}
              onDataSharing={handleDataSharing}
              onLogout={handleLogout}
              onNavigation={handleNavigation}
              getUserDisplayName={getUserDisplayName}
            />
          </div>
        </div>

        {/* Mobile menu */}
        <NavbarMobile
          isOpen={isMenuOpen}
          isAuthenticated={isAuthenticated}
          mounted={mounted}
          companyId={companyId}
          allCompanies={allCompanies}
          isActive={isActive}
          onClose={() => setIsMenuOpen(false)}
          onCompanySelect={handleCompanySelect}
          onCreateCompany={handleCreateCompany}
          onCompanySettings={handleCompanySettings}
          onManageUsers={handleManageUsers}
          onDataSharing={handleDataSharing}
          onLogout={handleLogout}
          onNavigation={handleNavigation}
        />
      </nav>
    </>
  );
}
