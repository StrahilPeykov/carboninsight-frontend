// Client-side hook directive - required for DOM manipulation and browser event handling
"use client";

// React hooks for lifecycle management and mutable references
import { useEffect, useRef } from "react";

// Props interface for focus management configuration
// Provides comprehensive control over accessibility and user interaction during tours
interface FocusManagementProps {
  isVisible: boolean; // Controls whether focus management is active
  canSkip: boolean; // Determines if user can escape tour via keyboard
  onSkip: () => void; // Callback function executed when user skips tour
  tooltipRef: React.RefObject<HTMLDivElement | null>; // Reference to tooltip element for focus control
}

// Custom hook for comprehensive accessibility and focus management during tours
// Implements WCAG guidelines for modal dialogs and keyboard navigation
// Handles scroll prevention, focus trapping, and proper cleanup for optimal UX
export function useFocusManagement({ isVisible, canSkip, onSkip, tooltipRef }: FocusManagementProps) {
  // Store reference to previously focused element for restoration after tour
  // Ensures seamless user experience by returning focus to original location
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Effect to prevent scrolling during tour for focused user experience
  // Maintains visual context by keeping highlighted elements in view
  // Prevents accidental scroll-away from important tour content
  useEffect(() => {
    if (!isVisible) return;

    // Capture current scroll position to maintain visual context
    // Prevents tour from being disrupted by scroll position changes
    const scrollPositionRef = {
      x: window.scrollX, // Horizontal scroll position
      y: window.scrollY, // Vertical scroll position
    };

    // Event handler to prevent all scroll-related events
    // Maintains consistent visual state throughout tour duration
    const preventScroll = (e: Event) => {
      e.preventDefault(); // Block default scroll behavior
      // Force scroll position back to original location
      window.scrollTo(scrollPositionRef.x, scrollPositionRef.y);
    };

    // Disable all forms of scrolling during tour
    document.body.style.overflow = "hidden"; // CSS-based scroll prevention
    // Event-based scroll prevention for comprehensive coverage
    window.addEventListener("scroll", preventScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false }); // Mouse wheel
    window.addEventListener("touchmove", preventScroll, { passive: false }); // Touch gestures

    // Cleanup function restores normal scrolling behavior
    return () => {
      document.body.style.overflow = ""; // Reset overflow style
      window.removeEventListener("scroll", preventScroll);
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [isVisible]);

  // Effect for comprehensive focus management and accessibility compliance
  // Implements WCAG 2.1 guidelines for modal dialog focus behavior
  // Ensures screen readers and keyboard users have proper tour experience
  useEffect(() => {
    if (!isVisible) return;

    // Store currently focused element for restoration after tour completion
    // Critical for maintaining user's context and workflow continuity
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock page scroll to prevent navigation away from tour content
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Hide main application content from screen readers during tour
    // Focuses assistive technology attention on tour content only
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.setAttribute("aria-hidden", "true");
    }

    // Transfer focus to tour tooltip for immediate keyboard accessibility
    // Ensures screen readers announce tour content immediately
    tooltipRef.current?.focus();

    // Cleanup function restores original page state and focus
    return () => {
      // Restore original scroll behavior
      document.body.style.overflow = origOverflow;

      // Re-enable main content for screen readers
      if (mainContent) {
        mainContent.removeAttribute("aria-hidden");
      }

      // Return focus to original element for seamless user experience
      // Maintains workflow continuity after tour completion
      previousActiveElement.current?.focus();
    };
  }, [isVisible, tooltipRef]);

  // Effect for focus trap implementation within tour tooltip
  // Prevents keyboard focus from escaping tour area, maintaining user attention
  // Essential for accessibility compliance and preventing user confusion
  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    // Find all focusable elements within tooltip for trap boundaries
    // Comprehensive selector covers all standard focusable element types
    const focusableElements = tooltip.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Tab key handler for circular focus navigation within tooltip
    // Implements proper focus trap behavior per WCAG guidelines
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      // Handle Shift+Tab (reverse direction) focus trapping
      if (e.shiftKey) {
        // If focus is on first element, wrap to last element
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Handle Tab (forward direction) focus trapping
        // If focus is on last element, wrap to first element
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Set initial focus to tooltip container for immediate accessibility
    tooltip.focus();
    // Register global tab key handler for focus trapping
    document.addEventListener("keydown", trapFocus);

    // Cleanup function removes event listener to prevent memory leaks
    return () => {
      document.removeEventListener("keydown", trapFocus);
    };
  }, [isVisible, tooltipRef]);

  // Effect for keyboard navigation and escape key handling
  // Provides intuitive keyboard shortcuts for tour control and user escape mechanism
  // Essential for accessibility and user autonomy during guided experiences
  useEffect(() => {
    if (!isVisible) return;

    // Global keyboard event handler for tour-specific shortcuts
    // Processes key commands that should work regardless of focus location
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key handler for tour dismissal
      // Only allows escape if tour step permits skipping (respects tour design)
      if (e.key === "Escape" && canSkip) {
        onSkip(); // Execute skip callback to properly close tour
      }
    };

    // Register global keyboard listener for immediate key response
    document.addEventListener("keydown", handleKeyDown);
    
    // Cleanup function prevents memory leaks and duplicate handlers
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, canSkip, onSkip]);
}
