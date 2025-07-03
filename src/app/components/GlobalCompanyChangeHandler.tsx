// Client-side component directive for Next.js App Router
// Required for components using browser APIs and custom event handling
"use client";

// React hook for side effects and event listener management
import { useEffect } from "react";
// Next.js navigation hooks for programmatic routing and path detection
// useRouter: Enables programmatic navigation between pages
// usePathname: Provides current route path for page-specific logic
import { useRouter, usePathname } from "next/navigation";

// Global company change handler for multi-tenant application state management
// Listens for custom "companyChanged" events and handles page-specific responses
// Implements different strategies based on page context: redirect, reload, or ignore
// Essential for maintaining data consistency when users switch between companies
export default function GlobalCompanyChangeHandler() {
  const router = useRouter();
  
  // Current pathname for page-specific company change handling
  // Determines the appropriate response strategy based on current route
  const pathname = usePathname();

  // Effect hook for company change event handling
  // Sets up global event listener for multi-tenant company switching
  // Implements cleanup to prevent memory leaks and duplicate listeners
  useEffect(() => {
    // Company change event handler with page-specific logic
    // Responds to custom "companyChanged" events dispatched throughout the application
    // Implements three different strategies based on current page context
    const handleCompanyChange = () => {
      console.log("Global company change detected on:", pathname);

      // Pages that should redirect to dashboard instead of reloading
      // These pages are company-agnostic or become invalid after company change
      // Redirecting provides better UX than showing potentially irrelevant content
      const redirectPages = ["/list-companies", "/create-company"];

      // Pages that should NOT reload when company changes
      // These are navigation/settings pages within the same company context
      // Reloading would interrupt user workflow without providing value
      const noReloadPages = ["/company-details", "/manage-user", "/product-data-sharing"];

      // Handle redirect pages - navigate to dashboard for fresh start
      if (redirectPages.includes(pathname)) {
        router.push("/dashboard");
      } 
      // Handle navigation pages - skip reload to maintain user workflow
      else if (noReloadPages.includes(pathname)) {
        // Don't reload these pages - they're just navigation within the same company
        console.log("Skipping reload for navigation page:", pathname);
        return;
      } 
      // Handle all other pages - reload to ensure fresh company-specific data
      else {
        // For all other pages, reload to get fresh data
        // This ensures product lists, dashboards, and data pages show correct company content
        window.location.reload();
      }
    };

    // Register global event listener for company change events
    // Custom event allows decoupled communication between company selector and handlers
    window.addEventListener("companyChanged", handleCompanyChange);

    // Cleanup function to remove event listener when component unmounts
    // Prevents memory leaks and duplicate event handlers
    // Essential for proper component lifecycle management
    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
    };
  }, [pathname, router]); // Dependencies ensure handler updates when route or router changes

  // Component renders nothing - purely functional for event handling
  // Acts as invisible global service for multi-tenant state management
  return null; // This component renders nothing, just handles events
}
