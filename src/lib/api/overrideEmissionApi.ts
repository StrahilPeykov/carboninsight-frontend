/**
 * Override emission factor API types
 * Defines interfaces for custom emission factor overrides in lifecycle calculations
 */

// Interface representing lifecycle stage choices for emission calculations
export interface LifecycleStageChoice {
  value: string; // Internal value used in calculations
  display_name: string; // Human-readable name for UI display
}
