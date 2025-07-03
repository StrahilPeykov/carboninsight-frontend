// Client-side hook directive - required for DOM manipulation and browser APIs
"use client";

// React hooks for state management, memoization, references, and lifecycle effects
import { useState, useCallback, useRef, useEffect } from "react";

// Minimal TourStep interface for positioning requirements
// Contains only the properties needed for element targeting and tooltip placement
interface TourStep {
  target: string; // CSS selector for element to highlight and position relative to
  placement?: "top" | "bottom" | "left" | "right" | "center"; // Tooltip positioning preference
  spotlightPadding?: number; // Additional padding around highlighted element
}

// Custom hook for intelligent tooltip positioning and target element management
// Handles dynamic element finding, viewport-aware positioning, and responsive updates
// Implements robust retry mechanisms for elements that load asynchronously
export function usePositioning(currentStepData: TourStep | null) {
  // State for target element's bounding rectangle - used for positioning calculations
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  // State for actual DOM element reference - used for visibility checks and event handling
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  
  // Refs for cleanup and state management without triggering re-renders
  const observerRef = useRef<MutationObserver | null>(null); // DOM change observer for dynamic content
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout reference for debouncing
  const scrollPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // Scroll position tracking

  // Enhanced element finding function with robust retry logic and fallback mechanisms
  // Handles dynamic content, multiple selector patterns, and asynchronous element loading
  // Memoized to prevent unnecessary re-creation and maintain stable references
  const findTargetElement = useCallback(
    (target: string) => {
      // Clean up any existing observers and timeouts to prevent memory leaks
      // Essential for handling rapid step changes and component cleanup
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Core element finding logic with support for multiple selector strategies
      // Returns boolean indicating success to enable retry mechanisms
      const attemptFind = (attempt: number = 1): boolean => {
        // Support comma-separated selectors for fallback options
        // Allows graceful degradation when primary selectors fail
        const selectors = target.split(",").map(s => s.trim());
        let element: HTMLElement | null = null;

        // Iterate through selector options until one succeeds
        for (const selector of selectors) {
          try {
            // Special handling for text-based element selection
            // Useful for buttons and links where CSS selectors are insufficient
            if (selector.includes(":has-text(")) {
              const textMatch = selector.match(/:has-text\("([^"]+)"\)/);
              if (textMatch) {
                const baseSelector = selector.split(":has-text(")[0];
                const searchText = textMatch[1];
                // Query base elements and filter by text content
                const candidates = document.querySelectorAll(baseSelector || "button");
                for (const candidate of candidates) {
                  if (candidate.textContent?.includes(searchText)) {
                    element = candidate as HTMLElement;
                    break;
                  }
                }
              }
            } else {
              // Standard CSS selector approach for most elements
              element = document.querySelector(selector) as HTMLElement;
            }

            // Break on first successful element find
            if (element) {
              break;
            }
          } catch (error) {
            // Log selector errors but continue with other options
            console.warn(`OnboardingTour: Invalid selector: ${selector}`, error);
            continue;
          }
        }

        // Validate element visibility and dimensions before accepting
        if (element) {
          // Get element's position and size information
          const rect = element.getBoundingClientRect();
          // Comprehensive visibility check including CSS properties
          const isVisible =
            rect.width > 0 && // Has width
            rect.height > 0 && // Has height
            getComputedStyle(element).display !== "none" && // Not display hidden
            getComputedStyle(element).visibility !== "hidden"; // Not visibility hidden

          if (isVisible) {
            // Update state with valid element and its position
            setTargetRect(rect);
            setTargetElement(element);
            // Ensure element is visible in viewport for optimal user experience
            scrollElementIntoView(element, rect);
            return true; // Success
          }
        }
        return false; // Failed to find visible element
      };

      // Immediate attempt for elements already in DOM
      // Most elements will be found on first try for optimal performance
      if (!attemptFind()) {
        // Setup retry mechanism for dynamically loaded content
        setupRetryMechanism(attemptFind);
      }
    },
    [targetElement] // Dependency ensures cleanup when target changes
  );

  // Function to ensure target element is visible in viewport for optimal user experience
  // Implements smooth scrolling with position tracking for tour continuity
  const scrollElementIntoView = (element: HTMLElement, rect: DOMRect) => {
    // Check if element is already fully visible in current viewport
    // Avoids unnecessary scrolling that could disrupt user experience
    const isInViewport =
      rect.top >= 0 && // Top edge visible
      rect.bottom <= window.innerHeight && // Bottom edge visible
      rect.left >= 0 && // Left edge visible
      rect.right <= window.innerWidth; // Right edge visible

    // Only scroll if element is not fully visible
    if (!isInViewport) {
      // Store current scroll position for potential restoration
      // Useful for maintaining context when tour completes
      scrollPositionRef.current = {
        x: window.scrollX,
        y: window.scrollY,
      };

      // Smooth scroll to center element in viewport
      // Provides optimal visibility for highlighted element
      element.scrollIntoView({
        behavior: "smooth", // Smooth animation for better UX
        block: "center", // Center vertically in viewport
        inline: "center", // Center horizontally in viewport
      });

      // Update stored scroll position after scrolling completes
      // Accounts for animation timing to get final position
      setTimeout(() => {
        scrollPositionRef.current = {
          x: window.scrollX,
          y: window.scrollY,
        };
      }, 500); // 500ms should cover most smooth scroll animations
    }
  };

  // Comprehensive retry mechanism for handling dynamic content and async loading
  // Uses multiple strategies to find elements that may not be immediately available
  const setupRetryMechanism = (attemptFind: () => boolean) => {
    // Set up MutationObserver to watch for DOM changes
    // Automatically retries when new content is added or modified
    observerRef.current = new MutationObserver(() => {
      // Debounce observer calls to prevent excessive retries
      // DOM mutations can fire rapidly, so we batch the attempts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Delayed retry attempt after DOM settles
      retryTimeoutRef.current = setTimeout(() => {
        // Attempt to find element and disconnect observer on success
        if (attemptFind() && observerRef.current) {
          observerRef.current.disconnect();
        }
      }, 100); // 100ms debounce for DOM stability
    });

    // Configure observer to watch for relevant DOM changes
    // Comprehensive monitoring covers most dynamic content scenarios
    observerRef.current.observe(document.body, {
      childList: true, // Watch for added/removed elements
      subtree: true, // Watch entire document tree
      attributes: true, // Watch for attribute changes
      attributeFilter: ["class", "style", "hidden"], // Focus on visibility-related attributes
    });

    // Additional scheduled retry attempts with exponential backoff
    // Handles cases where MutationObserver might miss changes
    const retryDelays = [100, 300, 800, 2000]; // Progressive delays in milliseconds
    retryDelays.forEach((delay, index) => {
      setTimeout(() => {
        // Only retry if element hasn't been found yet
        if (!targetElement && attemptFind()) {
          // Clean up observer on successful find
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      }, delay);
    });

    // Final timeout fallback with graceful degradation
    // Prevents infinite waiting and provides user feedback
    setTimeout(() => {
      if (observerRef.current && !targetElement) {
        observerRef.current.disconnect();
        // Log warning for debugging while failing gracefully
        console.warn(
          `OnboardingTour: Target not found after timeout: ${currentStepData?.target}, showing center placement`
        );
        // Reset state to trigger center placement fallback
        setTargetRect(null);
        setTargetElement(null);
      }
    }, 5000); // 5 second maximum wait time
  };

  // Intelligent tooltip positioning function with viewport-aware calculations
  // Dynamically positions tooltips relative to target elements while staying within viewport bounds
  // Memoized for performance optimization during frequent position updates
  const getTooltipPosition = useCallback((tooltipRef: React.RefObject<HTMLDivElement | null>) => {
    // Fallback to center positioning when no target or center placement specified
    // Provides graceful degradation for failed element targeting
    if (!targetRect || !tooltipRef.current || !currentStepData || currentStepData.placement === "center") {
      return { 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%, -50%)" // Perfect centering with CSS transform
      };
    }

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 20; // Minimum distance from target element
    let position: any = {};

    // Calculate initial position based on placement preference
    // Each placement optimizes for readability and visual hierarchy
    switch (currentStepData.placement || "bottom") {
      case "top":
        // Position above target with centered horizontal alignment
        position = {
          top: targetRect.top - tooltipRect.height - padding,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        };
        break;
      case "bottom":
        // Position below target with centered horizontal alignment (default)
        position = {
          top: targetRect.bottom + padding,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        };
        break;
      case "left":
        // Position to left of target with centered vertical alignment
        position = {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.left - tooltipRect.width - padding,
        };
        break;
      case "right":
        // Position to right of target with centered vertical alignment
        position = {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.right + padding,
        };
        break;
    }

    // Viewport boundary enforcement to ensure tooltip remains visible
    // Prevents tooltips from being cut off by screen edges
    position.top = Math.max(
      padding, // Minimum distance from top edge
      Math.min(position.top, window.innerHeight - tooltipRect.height - padding) // Maximum distance from bottom
    );
    position.left = Math.max(
      padding, // Minimum distance from left edge
      Math.min(position.left, window.innerWidth - tooltipRect.width - padding) // Maximum distance from right
    );

    return position;
  }, [targetRect, currentStepData]); // Re-calculate when target or placement changes

  // Effect to handle responsive positioning updates on window resize
  // Ensures tooltips remain properly positioned when viewport dimensions change
  useEffect(() => {
    if (!targetElement) return;

    // Function to recalculate target element position after resize
    // Maintains accurate positioning for dynamic layouts and responsive design
    const updatePosition = () => {
      if (targetElement) {
        // Get fresh bounding rectangle with updated position
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    // Register resize listener for responsive positioning updates
    window.addEventListener("resize", updatePosition);
    
    // Cleanup function prevents memory leaks
    return () => window.removeEventListener("resize", updatePosition);
  }, [targetElement]); // Re-register when target element changes

  // Effect for comprehensive cleanup on component unmount
  // Prevents memory leaks and zombie observers/timeouts
  useEffect(() => {
    return () => {
      // Clean up MutationObserver to prevent continued DOM monitoring
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only on unmount

  // Return hook API with positioning utilities and state
  // Provides external components with all necessary positioning functionality
  return {
    targetRect, // Current target element's bounding rectangle
    targetElement, // Reference to actual DOM element
    scrollPositionRef, // Scroll position tracking for restoration
    findTargetElement, // Function to locate and track target elements
    getTooltipPosition, // Function to calculate optimal tooltip positioning
  };
}
