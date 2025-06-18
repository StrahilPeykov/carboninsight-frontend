"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function GlobalCompanyChangeHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleCompanyChange = () => {
      console.log("Global company change detected on:", pathname);

      // Get the current company selection to determine action
      const hasCompany = localStorage.getItem("selected_company_id");

      // Pages that should redirect to specific locations when company changes
      const redirectPages = {
        "/list-companies": hasCompany ? "/dashboard" : "/list-companies", // Only redirect if company selected
        "/create-company": hasCompany ? "/dashboard" : "/list-companies",
      };

      // Pages that should NOT reload when company changes (navigation within same company context)
      const noReloadPages = [
        "/company-details", 
        "/manage-user", 
        "/product-data-sharing",
        "/account", // User account pages shouldn't reload on company change
        "/support", // Support pages don't depend on company
        "/accessibility", // Static pages
        "/privacy", // Static pages
      ];

      // Pages that require a company and should redirect to company selection if none
      const companyRequiredPages = [
        "/dashboard",
        "/product-list",
        "/manage-user", 
        "/product-data-sharing",
        "/company-details",
      ];

      // If on a page that has specific redirect logic
      if (pathname in redirectPages) {
        const targetPage = redirectPages[pathname as keyof typeof redirectPages];
        if (targetPage !== pathname) { // Only redirect if different from current page
          console.log(`Redirecting from ${pathname} to ${targetPage}`);
          router.push(targetPage);
        }
        return;
      }

      // If on a page that shouldn't reload on company changes
      if (noReloadPages.some(page => pathname.startsWith(page))) {
        console.log("Skipping reload for navigation page:", pathname);
        return;
      }

      // If no company selected and on a page that requires one
      if (!hasCompany && companyRequiredPages.some(page => pathname.startsWith(page))) {
        console.log("No company selected, redirecting to company selection");
        router.push("/list-companies");
        return;
      }

      // For all other pages that depend on company data, reload to get fresh data
      // But only if a company is actually selected
      if (hasCompany) {
        console.log("Reloading page for company change:", pathname);
        window.location.reload();
      } else {
        console.log("No company selected, no action needed for:", pathname);
      }
    };

    const handleCompanyListChange = () => {
      console.log("Company list change detected on:", pathname);
      
      // Only reload if we're on a page that shows company lists or depends on company data
      const companyListDependentPages = [
        "/list-companies",
        "/dashboard", // Dashboard shows company stats
      ];

      if (companyListDependentPages.some(page => pathname.startsWith(page))) {
        console.log("Reloading for company list change on:", pathname);
        window.location.reload();
      } else {
        console.log("No reload needed for company list change on:", pathname);
      }
    };

    window.addEventListener("companyChanged", handleCompanyChange);
    window.addEventListener("companyListChanged", handleCompanyListChange);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
      window.removeEventListener("companyListChanged", handleCompanyListChange);
    };
  }, [pathname, router]);

  return null; // This component renders nothing, just handles events
}
