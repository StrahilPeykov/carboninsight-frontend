"use client";

// React hooks for effect management and callback memoization
import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Custom hook that provides keyboard shortcuts functionality for the application
 * Implements common shortcuts like search focus, help navigation, and context-aware creation
 * Automatically disables on mobile devices to prevent interference with virtual keyboards
 * 
 * @returns Object containing shortcut status and configuration info
 */
export function useKeyboardShortcuts() {
  // Router instance for programmatic navigation
  const router = useRouter();
  
  // Current pathname for context-aware shortcut behavior
  const pathname = usePathname();
  
  // Authentication state to enable/disable certain shortcuts
  const { isAuthenticated } = useAuth();

  // State to track if user is on mobile device (disables keyboard shortcuts)
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Effect to detect mobile devices and disable shortcuts accordingly
   * Mobile devices often have virtual keyboards that interfere with shortcuts
   */
  useEffect(() => {
    /**
     * Function to check if current viewport is mobile-sized
     * Uses md breakpoint (768px) as threshold for mobile detection
     */
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint from Tailwind
    };

    // Check mobile status on mount
    checkMobile();
    
    // Listen for window resize to update mobile status
    window.addEventListener("resize", checkMobile);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Function to check if the current focus target is an input field
   * Prevents shortcuts from firing when user is typing in forms
   * 
   * @param target - The event target to check
   * @returns Boolean indicating if target is an input field
   */
  const isInInputField = useCallback((target: EventTarget | null): boolean => {
    // Ensure target is a valid HTML element
    if (!target || !(target instanceof HTMLElement)) return false;

    // Get the tag name for comparison
    const tagName = target.tagName.toLowerCase();
    
    // Check if element is a form input
    const isInput = tagName === "input" || tagName === "textarea" || tagName === "select";
    
    // Check if element has contenteditable attribute
    const isContentEditable = target.contentEditable === "true";

    return isInput || isContentEditable;
  }, []);

  /**
   * Function to focus search input if available on current page
   * Searches for search input by placeholder text and focuses it
   */
  const focusSearch = useCallback(() => {
    // Look for search inputs with relevant placeholder text
    const searchInput = document.querySelector(
      'input[type="text"][placeholder*="Search"], input[placeholder*="search"]'
    ) as HTMLInputElement;
    
    if (searchInput) {
      searchInput.focus(); // Focus the search input
      searchInput.select(); // Select existing text for easy replacement

      // Announce action to screen readers for accessibility
      const statusAnnouncement = document.getElementById("status-announcements");
      if (statusAnnouncement) {
        statusAnnouncement.textContent = "Search field focused";
      }
    }
  }, []);

  /**
   * Function to show keyboard shortcuts help
   * Navigates to accessibility page with keyboard shortcuts section
   */
  const showHelp = useCallback(() => {
    // Navigate to accessibility page with hash to shortcuts section
    router.push("/accessibility#keyboard-shortcuts");

    // Announce navigation to screen readers
    const statusAnnouncement = document.getElementById("status-announcements");
    if (statusAnnouncement) {
      statusAnnouncement.textContent = "Navigating to keyboard shortcuts help";
    }
  }, [router]);

  /**
   * Function to handle context-aware "new" action shortcut
   * Determines appropriate creation action based on current page and user state
   */
  const handleCreateNew = useCallback(() => {
    // Only allow creation shortcuts for authenticated users
    if (!isAuthenticated) return;

    let destination = ""; // Target route for creation
    let action = ""; // Description of action for screen reader

    // Determine creation action based on current page context
    if (pathname.includes("/product-list")) {
      // On product list page, create new product
      destination = "/product-list/product";
      action = "Creating new product";
    } else if (pathname.includes("/list-companies") || pathname.includes("/dashboard")) {
      // On company-related pages, create new company
      destination = "/create-company";
      action = "Creating new company";
    } else {
      // Default action based on whether user has a company selected
      const hasCompany =
        typeof window !== "undefined" && localStorage.getItem("selected_company_id");
      
      if (hasCompany) {
        // User has company, default to creating product
        destination = "/product-list/product";
        action = "Creating new product";
      } else {
        // No company, default to creating company
        destination = "/create-company";
        action = "Creating new company";
      }
    }

    // Navigate to determined destination
    router.push(destination);

    // Announce action to screen readers
    const statusAnnouncement = document.getElementById("status-announcements");
    if (statusAnnouncement) {
      statusAnnouncement.textContent = action;
    }
  }, [pathname, router, isAuthenticated]);

  /**
   * Main keyboard event handler that processes shortcut key presses
   * Implements various keyboard shortcuts with proper conflict avoidance
   * 
   * @param event - Keyboard event to process
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Early return if on mobile device to prevent virtual keyboard issues
      if (isMobile) {
        return;
      }

      // Check if tour is active - if so, don't interfere with tour keyboard handling
      const isTourActive = document.body.classList.contains("tour-active");

      // Always allow Escape to close modals/menus UNLESS tour is active
      if (event.key === "Escape" && !isTourActive) {
        // Find and close any open modal dialogs
        const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector(
            'button[aria-label*="Close"], button[aria-label*="close"]'
          ) as HTMLButtonElement;
          if (closeButton) {
            closeButton.click(); // Trigger close button
          }
        });

        // Close any open dropdown menus
        const dropdowns = document.querySelectorAll('[aria-expanded="true"]');
        dropdowns.forEach(dropdown => {
          if (dropdown instanceof HTMLButtonElement) {
            dropdown.click(); // Collapse dropdown
          }
        });

        return; // Exit early after handling escape
      }

      // Don't interfere when user is typing in form inputs
      if (isInInputField(event.target)) {
        return;
      }

      // Handle simple shortcuts that don't conflict with browsers
      switch (event.key) {
        case "/":
          // Focus search input when "/" is pressed
          event.preventDefault(); // Prevent default browser behavior
          focusSearch();
          break;

        case "?":
          // Show help when "?" is pressed (requires Shift key)
          if (event.shiftKey) {
            event.preventDefault();
            showHelp();
          }
          break;

        case "n":
        case "N":
          // Create new item when "N" is pressed (context-aware)
          // Only when not in input field (double-check for safety)
          if (!isInInputField(event.target)) {
            event.preventDefault();
            handleCreateNew();
          }
          break;

        default:
          // No action for other keys - allows normal browser shortcuts
          break;
      }
    },
    [isInInputField, focusSearch, showHelp, handleCreateNew, isMobile]
  );

  /**
   * Effect to set up and clean up keyboard event listeners
   * Only registers listeners when not on mobile devices
   */
  useEffect(() => {
    // Don't set up event listeners on mobile devices
    if (isMobile) {
      return;
    }

    // Add global keydown event listener
    document.addEventListener("keydown", handleKeyDown);
    
    // Cleanup event listener on unmount or dependency change
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, isMobile]);

  // Return minimal info about shortcuts for consuming components
  return {
    shortcutsEnabled: !isMobile, // Whether shortcuts are currently enabled
    shortcutCount: isMobile ? 0 : 4, // Number of available shortcuts (/, ?, Escape, N)
  };
}
