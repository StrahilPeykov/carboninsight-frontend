import { useState, useEffect } from 'react';

export function useCompanyData() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get initial company ID
  useEffect(() => {
    if (!mounted) return;
    
    const id = typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
    setCompanyId(id);
  }, [mounted]);

  // Listen for company changes
  useEffect(() => {
    if (!mounted) return;

    const handleCompanyChange = (event: Event) => {
      console.log("Company change detected in useCompanyData hook");
      const id = localStorage.getItem("selected_company_id");
      setCompanyId(id);
    };

    // Listen for both events - using proper Event type
    window.addEventListener("companyChanged", handleCompanyChange);
    window.addEventListener("companyListChanged", handleCompanyChange);
    
    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
      window.removeEventListener("companyListChanged", handleCompanyChange);
    };
  }, [mounted]);

  return { companyId, mounted };
}