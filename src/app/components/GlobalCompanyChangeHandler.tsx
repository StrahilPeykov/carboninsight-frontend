"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function GlobalCompanyChangeHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleCompanyChange = () => {
      console.log("Global company change detected on:", pathname);
      
      // Pages that should redirect instead of reload
      const redirectPages = ["/list-companies", "/create-company"];
      
      if (redirectPages.includes(pathname)) {
        router.push("/dashboard");
      } else {
        // For all other pages, reload to get fresh data
        window.location.reload();
      }
    };

    window.addEventListener("companyChanged", handleCompanyChange);
    
    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
    };
  }, [pathname, router]);

  return null; // This component renders nothing, just handles events
}