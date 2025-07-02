"use client";

import { useEffect, useRef } from "react";

interface FocusManagementProps {
  isVisible: boolean;
  canSkip: boolean;
  onSkip: () => void;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}

export function useFocusManagement({ isVisible, canSkip, onSkip, tooltipRef }: FocusManagementProps) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Prevent scrolling during tour
  useEffect(() => {
    if (!isVisible) return;

    // Store current scroll position
    const scrollPositionRef = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const preventScroll = (e: Event) => {
      e.preventDefault();
      window.scrollTo(scrollPositionRef.x, scrollPositionRef.y);
    };

    // Disable scrolling
    document.body.style.overflow = "hidden";
    window.addEventListener("scroll", preventScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("scroll", preventScroll);
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [isVisible]);

  // Focus management
  useEffect(() => {
    if (!isVisible) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Add aria-hidden to main content
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.setAttribute("aria-hidden", "true");
    }

    // Focus the modal
    tooltipRef.current?.focus();

    return () => {
      // Restore body scroll
      document.body.style.overflow = origOverflow;

      // Remove aria-hidden from main content
      if (mainContent) {
        mainContent.removeAttribute("aria-hidden");
      }

      // Return focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isVisible, tooltipRef]);

  // Focus trap
  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const focusableElements = tooltip.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Focus the tooltip initially
    tooltip.focus();
    document.addEventListener("keydown", trapFocus);

    return () => {
      document.removeEventListener("keydown", trapFocus);
    };
  }, [isVisible, tooltipRef]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canSkip) {
        onSkip();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, canSkip, onSkip]);
}
