// React import for component definition and event handling
import React from "react";

// Props interface for TourSpotlight component
// Defines the configuration options for spotlight overlay and user interaction handling
interface TourSpotlightProps {
  // Bounding rectangle of element to highlight (null for center placement)
  targetRect: DOMRect | null; 
  // Tooltip positioning relative to target
  placement?: "top" | "bottom" | "left" | "right" | "center"; 
  // Additional padding around highlighted element for visual emphasis
  spotlightPadding?: number; 
  // Whether clicking outside spotlight area should dismiss tour
  allowClickOutside?: boolean;
  // Whether user is allowed to skip current tour step 
  canSkip: boolean; 
  // Callback function executed when user skips tour
  onSkip: () => void; 
}

// TourSpotlight component creates visual overlay with highlighted target area
// Implements spotlight effect using SVG masking and click-blocking regions
// Manages user interaction outside of highlighted areas for tour control
export default function TourSpotlight({
  targetRect,
  placement,
  // Default padding provides comfortable visual spacing
  spotlightPadding = 8, 
  // Default allows flexible user interaction
  allowClickOutside = true, 
  canSkip,
  onSkip,
}: TourSpotlightProps) {
  
  // Function to create click-blocking areas around the spotlight
  // Prevents user interaction with page elements outside highlighted area
  // Returns different configurations based on placement type and target existence
  const getBlockingAreas = () => {
    // Handle center placement or missing target - create full-screen transparent blocker
    // Center placement doesn't highlight specific elements, so entire screen is clickable
    if (!targetRect || placement === "center") {
      return (
        <div
          className="fixed inset-0 bg-transparent"
          style={{
            // Enables click detection across entire screen
            pointerEvents: "auto",
            // High z-index ensures blocker appears above page content 
            zIndex: 9997, 
          }}
          onClick={e => {
            // Prevents event bubbling to avoid conflicts
            e.stopPropagation(); 
            // Allow tour dismissal if both conditions are met
            if (allowClickOutside && canSkip) {
              onSkip();
            }
          }}
        />
      );
    }

    // Calculate spotlight area with padding for precise click blocking
    // Creates boundaries that define the non-interactive region around target
    const spotlight = {
      // Top boundary with padding
      top: targetRect.top - spotlightPadding, 
      // Left boundary with padding
      left: targetRect.left - spotlightPadding, 
      // Right boundary with padding
      right: targetRect.right + spotlightPadding, 
      // Bottom boundary with padding
      bottom: targetRect.bottom + spotlightPadding, 
    };

    // Shared click handler for all blocking areas
    // Provides consistent behavior across different blocker regions
    const handleBlockerClick = (e: React.MouseEvent) => {
      // Prevents event bubbling conflicts
      e.stopPropagation(); 
      // Check permissions before allowing tour dismissal
      if (allowClickOutside && canSkip) {
        onSkip();
      }
    };

    return (
      <>
        {/* Top blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: spotlight.top,
            pointerEvents: "auto",
            zIndex: 9997,
          }}
          onClick={handleBlockerClick}
        />
        {/* Bottom blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: spotlight.bottom,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "auto",
            zIndex: 9997,
          }}
          onClick={handleBlockerClick}
        />
        {/* Left blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: spotlight.top,
            left: 0,
            width: spotlight.left,
            height: spotlight.bottom - spotlight.top,
            pointerEvents: "auto",
            zIndex: 9997,
          }}
          onClick={handleBlockerClick}
        />
        {/* Right blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: spotlight.top,
            left: spotlight.right,
            right: 0,
            height: spotlight.bottom - spotlight.top,
            pointerEvents: "auto",
            zIndex: 9997,
          }}
          onClick={handleBlockerClick}
        />
      </>
    );
  };

  return (
    <>
      {/* Visual backdrop with spotlight */}
      <div className="fixed inset-0 z-[9996] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && placement !== "center" && (
                <rect
                  x={targetRect.left - spotlightPadding}
                  y={targetRect.top - spotlightPadding}
                  width={targetRect.width + spotlightPadding * 2}
                  height={targetRect.height + spotlightPadding * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Click blockers around spotlight */}
      {getBlockingAreas()}

      {/* Border around target element */}
      {targetRect && placement !== "center" && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetRect.top - spotlightPadding - 2,
            left: targetRect.left - spotlightPadding - 2,
            width: targetRect.width + spotlightPadding * 2 + 4,
            height: targetRect.height + spotlightPadding * 2 + 4,
            border: "2px solid #c20016",
            borderRadius: "8px",
          }}
        />
      )}
    </>
  );
}
