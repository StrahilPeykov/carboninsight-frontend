"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function GlobalCompanyChangeHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleCompanyChange = () => {
      console.log("Global company change detected on:", pathname);

      const hasCompany = localStorage.getItem("selected_company_id");
      console.log("Has company:", hasCompany);

      // Pages that should redirect to company selection when no company selected
      const companyRequiredPages = [
        "/dashboard",
        "/product-list",
        "/manage-user", 
        "/product-data-sharing",
        "/company-details",
      ];

      // Pages that should redirect away when company changes (because they become invalid)
      const invalidateOnCompanyChangePages = [
        "/product-list/product", // Product edit page - invalid when company changes
        "/product-list/emissions-tree", // Emissions tree for specific product
      ];

      // Pages that are user-specific and don't depend on company
      const userSpecificPages = [
        "/account",
        "/support", 
        "/accessibility",
        "/privacy",
      ];

      // If no company selected and on a page that requires one
      if (!hasCompany && companyRequiredPages.some(page => pathname.startsWith(page))) {
        console.log("No company selected, redirecting to company selection");
        router.push("/list-companies");
        return;
      }

      // If on a page that becomes invalid when company changes, redirect to safe page
      if (hasCompany && invalidateOnCompanyChangePages.some(page => pathname.startsWith(page))) {
        console.log("Page invalid for new company, redirecting to product list");
        router.push("/product-list");
        return;
      }

      // If on user-specific pages, don't do anything
      if (userSpecificPages.some(page => pathname.startsWith(page))) {
        console.log("User-specific page, no action needed");
        return;
      }

      // If we have a company and we're on a company-dependent page, reload to get fresh data
      if (hasCompany && companyRequiredPages.some(page => pathname.startsWith(page))) {
        console.log("Reloading page for fresh company data:", pathname);
        window.location.reload();
        return;
      }

      // For other pages, no action needed
      console.log("No action needed for:", pathname);
    };

    const handleCompanyListChange = () => {
      console.log("Company list change detected on:", pathname);
      
      // Only reload if we're on a page that shows company lists
      const companyListDependentPages = [
        "/list-companies",
        "/dashboard", // Dashboard shows company stats
      ];

      if (companyListDependentPages.some(page => pathname.startsWith(page))) {
        console.log("Reloading for company list change on:", pathname);
        window.location.reload();
      }
    };

    window.addEventListener("companyChanged", handleCompanyChange);
    window.addEventListener("companyListChanged", handleCompanyListChange);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
      window.removeEventListener("companyListChanged", handleCompanyListChange);
    };
  }, [pathname, router]);

  return null;
}
