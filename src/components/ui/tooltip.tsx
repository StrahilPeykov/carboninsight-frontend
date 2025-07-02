/**
 * Tooltip components provide accessible hover/focus information overlays.
 * Built on Radix UI primitives with custom styling and proper ARIA support.
 * Used throughout the application for contextual help and additional information.
 */

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * TooltipProvider component that wraps the application to enable tooltip functionality
 * @param delayDuration - Delay in milliseconds before tooltip appears (default: 0)
 * @param props - Additional TooltipPrimitive.Provider props
 * @returns Provider component that enables tooltips for child components
 */
function TooltipProvider({
  delayDuration = 0, // Immediate tooltip display for better UX
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider" // Data attribute for styling hooks
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/**
 * Tooltip root component that manages tooltip state and positioning
 * @param props - TooltipPrimitive.Root props for state management
 * @returns Root tooltip component with provider wrapper
 */
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

/**
 * TooltipTrigger component that triggers tooltip display on hover/focus
 * @param props - TooltipPrimitive.Trigger props for event handling
 * @returns Trigger element that shows tooltip on interaction
 */
function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * TooltipContent component that displays the actual tooltip content
 * @param className - Additional CSS classes for custom styling
 * @param sideOffset - Distance from trigger element (default: 0)
 * @param children - Content to display inside the tooltip
 * @param props - Additional TooltipPrimitive.Content props
 * @returns Styled tooltip content with portal rendering and animations
 */
function TooltipContent({
  className,
  sideOffset = 0, // No offset by default for closer positioning
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content" // Data attribute for styling hooks
        sideOffset={sideOffset}
        className={cn(
          // Base tooltip styling with animations and positioning
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        {/* Tooltip arrow element for visual connection to trigger */}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

// Export all tooltip components for use throughout the application
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
