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

      // Pages that should NOT reload when company changes (navigation within same company)
      const noReloadPages = ["/company-details", "/manage-user"];

      if (redirectPages.includes(pathname)) {
        router.push("/dashboard");
      } else if (noReloadPages.includes(pathname)) {
        // Don't reload these pages - they're just navigation within the same company
        console.log("Skipping reload for navigation page:", pathname);
        return;
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
