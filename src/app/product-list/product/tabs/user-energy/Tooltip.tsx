/**
 * Tooltip.tsx
 *
 * A reusable tooltip component built with Radix UI and React.
 *
 * Provides an accessible wrapper around RadixTooltip to display
 * contextual information when users hover or focus an element.
 */
"use client";

import React, { FC, ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

/**
 * Props for the Tooltip component..
 * @property content - The content to display inside the tooltip (ReactNode).
 * @property children - The element that triggers the tooltip on hover or focus.
 */
interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

// Tooltip component definition using Radix UI's Tooltip primitives.
export const Tooltip: FC<TooltipProps> = ({ content, children }) => (
  <RadixTooltip.Provider>
    <RadixTooltip.Root delayDuration={100}>
      <RadixTooltip.Trigger asChild>
        <span className="inline-flex items-center cursor-pointer">{children}</span>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="bottom"
          align="center"
          className="z-50 rounded bg-gray-100 dark:bg-gray-900 text-white text-xs px-3 py-1 shadow-lg"
          sideOffset={6}
          role="tooltip"
        >
          {content}
          <RadixTooltip.Arrow className="fill-gray-800" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);
