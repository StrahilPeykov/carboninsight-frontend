/**
 * Utility functions for CSS class management
 * Provides optimized class name concatenation and conflict resolution
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine and merge CSS class names with Tailwind CSS conflict resolution
 * 
 * This utility function combines clsx for conditional class handling with
 * tailwind-merge for intelligent Tailwind CSS class conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
