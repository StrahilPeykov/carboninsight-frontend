"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Check if we're in an input field, textarea, or contenteditable
  const isInInputField = useCallback((target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;

    const tagName = target.tagName.toLowerCase();
    const isInput = tagName === "input" || tagName === "textarea" || tagName === "select";
    const isContentEditable = target.contentEditable === "true";

    return isInput || isContentEditable;
  }, []);

  // Focus search input if available
  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector(
      'input[type="text"][placeholder*="Search"], input[placeholder*="search"]'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();

      // Announce to screen readers
      const statusAnnouncement = document.getElementById("status-announcements");
      if (statusAnnouncement) {
        statusAnnouncement.textContent = "Search field focused";
      }
    }
  }, []);

  // Show help by going to accessibility page
  const showHelp = useCallback(() => {
    router.push("/accessibility#keyboard-shortcuts");

    // Announce to screen readers
    const statusAnnouncement = document.getElementById("status-announcements");
    if (statusAnnouncement) {
      statusAnnouncement.textContent = "Navigating to keyboard shortcuts help";
    }
  }, [router]);

  // Handle context-aware "new" action
  const handleCreateNew = useCallback(() => {
    if (!isAuthenticated) return;

    let destination = "";
    let action = "";

    if (pathname.includes("/product-list")) {
      destination = "/product-list/product";
      action = "Creating new product";
    } else if (pathname.includes("/list-companies") || pathname.includes("/dashboard")) {
      destination = "/create-company";
      action = "Creating new company";
    } else {
      // Default based on whether user has a company selected
      const hasCompany =
        typeof window !== "undefined" && localStorage.getItem("selected_company_id");
      if (hasCompany) {
        destination = "/product-list/product";
        action = "Creating new product";
      } else {
        destination = "/create-company";
        action = "Creating new company";
      }
    }

    router.push(destination);

    // Announce to screen readers
    const statusAnnouncement = document.getElementById("status-announcements");
    if (statusAnnouncement) {
      statusAnnouncement.textContent = action;
    }
  }, [pathname, router, isAuthenticated]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Always allow Escape to close modals/menus
      if (event.key === "Escape") {
        // Find and close any open modals
        const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector(
            'button[aria-label*="Close"], button[aria-label*="close"]'
          ) as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        });

        // Close any open dropdowns
        const dropdowns = document.querySelectorAll('[aria-expanded="true"]');
        dropdowns.forEach(dropdown => {
          if (dropdown instanceof HTMLButtonElement) {
            dropdown.click();
          }
        });

        return;
      }

      // Don't interfere when user is typing in inputs
      if (isInInputField(event.target)) {
        return;
      }

      // Handle simple shortcuts that don't conflict with browsers
      switch (event.key) {
        case "/":
          // Focus search
          event.preventDefault();
          focusSearch();
          break;

        case "?":
          // Show help - go to accessibility page
          if (event.shiftKey) {
            event.preventDefault();
            showHelp();
          }
          break;

        case "n":
        case "N":
          // Create new item (context-aware) - only when not in input
          if (!isInInputField(event.target)) {
            event.preventDefault();
            handleCreateNew();
          }
          break;

        default:
          // No action for other keys
          break;
      }
    },
    [isInInputField, focusSearch, showHelp, handleCreateNew]
  );

  // Set up event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return minimal info about shortcuts
  return {
    shortcutsEnabled: true,
    shortcutCount: 4, // /, ?, Escape, N
  };
}
