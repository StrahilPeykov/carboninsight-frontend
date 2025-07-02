"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { companyApi } from "@/lib/api/companyApi";
import { setLocalStorageItem } from "@/lib/api/apiClient";

interface Company {
  id: string;
  name: string;
}

interface CompanyData {
  name: string;
  vat_number: string;
  business_registration_number: string;
}

export function useNavbarState() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // Menu states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);

  // Company data
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize component
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get company ID from localStorage and listen for changes
  useEffect(() => {
    if (!mounted) return;

    const id = typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
    setCompanyId(id);

    const handleCompanyChange = () => {
      const id = localStorage.getItem("selected_company_id");
      setCompanyId(id);
      if (id && isAuthenticated && !isLoading) {
        fetchCompanyData(id);
      }
    };

    const handleCompanyListChange = () => {
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

  // Fetch data when dependencies change
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (!isProfileMenuOpen) setIsCompanyMenuOpen(false);
  };
  const toggleCompanyMenu = () => {
    const newState = !isCompanyMenuOpen;
    setIsCompanyMenuOpen(newState);
    if (newState) {
      setIsProfileMenuOpen(false);
      // Tour action dispatch
      const activeTour = sessionStorage.getItem("activeTour");
      if (activeTour === "main-onboarding") {
        window.dispatchEvent(
          new CustomEvent("tourAction", {
            detail: { action: "click-company-selector" },
          })
        );
      } else if (activeTour === "company-tour") {
        window.dispatchEvent(
          new CustomEvent("tourAction", {
            detail: { action: "click-company-selector-for-tour" },
          })
        );
      }
    }
  };

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

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

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

  return {
    // State
    isMenuOpen,
    isProfileMenuOpen,
    isCompanyMenuOpen,
    companyId,
    companyData,
    allCompanies,
    mounted,
    user,
    isAuthenticated,
    isLoading,
    pathname,

    // Actions
    toggleMenu,
    toggleProfileMenu,
    toggleCompanyMenu,
    handleLogout,
    setIsMenuOpen,
    setIsProfileMenuOpen,
    setIsCompanyMenuOpen,

    // Utils
    isActive,
    getUserDisplayName,
  };
}
