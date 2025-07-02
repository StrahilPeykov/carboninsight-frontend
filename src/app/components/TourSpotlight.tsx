import React from "react";

interface TourSpotlightProps {
  targetRect: DOMRect | null;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  spotlightPadding?: number;
  allowClickOutside?: boolean;
  canSkip: boolean;
  onSkip: () => void;
}

export default function TourSpotlight({
  targetRect,
  placement,
  spotlightPadding = 8,
  allowClickOutside = true,
  canSkip,
  onSkip,
}: TourSpotlightProps) {
  const getBlockingAreas = () => {
    if (!targetRect || placement === "center") {
      return (
        <div
          className="fixed inset-0 bg-transparent"
          style={{
            pointerEvents: "auto",
            zIndex: 9997,
          }}
          onClick={e => {
            e.stopPropagation();
            if (allowClickOutside && canSkip) {
              onSkip();
            }
          }}
        />
      );
    }

    const spotlight = {
      top: targetRect.top - spotlightPadding,
      left: targetRect.left - spotlightPadding,
      right: targetRect.right + spotlightPadding,
      bottom: targetRect.bottom + spotlightPadding,
    };

    const handleBlockerClick = (e: React.MouseEvent) => {
      e.stopPropagation();
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
