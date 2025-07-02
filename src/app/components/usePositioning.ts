"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface TourStep {
  target: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  spotlightPadding?: number;
}

export function usePositioning(currentStepData: TourStep | null) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Enhanced element finding with better retry logic
  const findTargetElement = useCallback(
    (target: string) => {
      // Clean up previous observer and timeout
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      const attemptFind = (attempt: number = 1): boolean => {
        // Try multiple selectors if comma-separated
        const selectors = target.split(",").map(s => s.trim());
        let element: HTMLElement | null = null;

        for (const selector of selectors) {
          try {
            // Special handling for button text matching
            if (selector.includes(":has-text(")) {
              const textMatch = selector.match(/:has-text\("([^"]+)"\)/);
              if (textMatch) {
                const baseSelector = selector.split(":has-text(")[0];
                const searchText = textMatch[1];
                const candidates = document.querySelectorAll(baseSelector || "button");
                for (const candidate of candidates) {
                  if (candidate.textContent?.includes(searchText)) {
                    element = candidate as HTMLElement;
                    break;
                  }
                }
              }
            } else {
              element = document.querySelector(selector) as HTMLElement;
            }

            if (element) {
              break;
            }
          } catch (error) {
            console.warn(`OnboardingTour: Invalid selector: ${selector}`, error);
            continue;
          }
        }

        if (element) {
          // Check if element is visible and has dimensions
          const rect = element.getBoundingClientRect();
          const isVisible =
            rect.width > 0 &&
            rect.height > 0 &&
            getComputedStyle(element).display !== "none" &&
            getComputedStyle(element).visibility !== "hidden";

          if (isVisible) {
            setTargetRect(rect);
            setTargetElement(element);
            scrollElementIntoView(element, rect);
            return true;
          }
        }
        return false;
      };

      // Try to find immediately
      if (!attemptFind()) {
        setupRetryMechanism(attemptFind);
      }
    },
    [targetElement]
  );

  const scrollElementIntoView = (element: HTMLElement, rect: DOMRect) => {
    const isInViewport =
      rect.top >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth;

    if (!isInViewport) {
      scrollPositionRef.current = {
        x: window.scrollX,
        y: window.scrollY,
      };

      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      // Update scroll position after scrolling
      setTimeout(() => {
        scrollPositionRef.current = {
          x: window.scrollX,
          y: window.scrollY,
        };
      }, 500);
    }
  };

  const setupRetryMechanism = (attemptFind: () => boolean) => {
    // Set up mutation observer to watch for the element
    observerRef.current = new MutationObserver(() => {
      // Debounce the observer calls
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      retryTimeoutRef.current = setTimeout(() => {
        if (attemptFind() && observerRef.current) {
          observerRef.current.disconnect();
        }
      }, 100);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden"],
    });

    // Additional retry attempts with exponential backoff
    const retryDelays = [100, 300, 800, 2000];
    retryDelays.forEach((delay, index) => {
      setTimeout(() => {
        if (!targetElement && attemptFind()) {
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      }, delay);
    });

    // Final timeout fallback
    setTimeout(() => {
      if (observerRef.current && !targetElement) {
        observerRef.current.disconnect();
        console.warn(
          `OnboardingTour: Target not found after timeout: ${currentStepData?.target}, showing center placement`
        );
        setTargetRect(null);
        setTargetElement(null);
      }
    }, 5000);
  };

  const getTooltipPosition = useCallback((tooltipRef: React.RefObject<HTMLDivElement | null>) => {
    if (!targetRect || !tooltipRef.current || !currentStepData || currentStepData.placement === "center") {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 20;
    let position: any = {};

    switch (currentStepData.placement || "bottom") {
      case "top":
        position = {
          top: targetRect.top - tooltipRect.height - padding,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        };
        break;
      case "bottom":
        position = {
          top: targetRect.bottom + padding,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        };
        break;
      case "left":
        position = {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.left - tooltipRect.width - padding,
        };
        break;
      case "right":
        position = {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.right + padding,
        };
        break;
    }

    // Keep tooltip within viewport
    position.top = Math.max(
      padding,
      Math.min(position.top, window.innerHeight - tooltipRect.height - padding)
    );
    position.left = Math.max(
      padding,
      Math.min(position.left, window.innerWidth - tooltipRect.width - padding)
    );

    return position;
  }, [targetRect, currentStepData]);

  // Update position on window resize
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [targetElement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    targetRect,
    targetElement,
    scrollPositionRef,
    findTargetElement,
    getTooltipPosition,
  };
}
