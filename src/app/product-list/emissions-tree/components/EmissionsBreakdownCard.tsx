// Import React functional component type for TypeScript support
import { FC } from "react";
// Import reusable Card UI component for consistent styling and layout
import Card from "../../../components/ui/Card";
// Import specialized table component for displaying emissions data in a structured format
import { EmissionsTable } from "../EmissionsTable";
// Import TypeScript interface for emissions data structure from API layer
import { EmissionTrace } from "@/lib/api/productApi";

// TypeScript interface defining the props required by the EmissionsBreakdownCard component
// This ensures type safety and provides clear documentation of expected data structure
interface EmissionsBreakdownCardProps {
  // Emissions data object containing hierarchical emission traces, can be null during loading
  emissions: EmissionTrace | null;
}

// Functional component that renders a card displaying detailed emissions breakdown information
// This component serves as a container for the emissions data visualization, handling both
// populated and empty states. It provides proper semantic HTML structure with accessibility
// attributes and maintains consistent styling through the Card wrapper component.
export const EmissionsBreakdownCard: FC<EmissionsBreakdownCardProps> = ({ emissions }) => {
  return (
    // Main card container with semantic section element and proper ARIA labeling
    // The mb-6 class provides consistent bottom margin spacing with other page components
    <Card className="mb-6" as="section" aria-labelledby="emissions-breakdown-heading">
      
      {/* Card header section containing the main heading for the emissions breakdown */}
      {/* Uses flexbox layout to position heading and maintain space for potential future actions */}
      <div className="flex justify-between items-center mb-4">
        {/* Primary heading for the emissions section with semantic h2 element */}
        {/* ID attribute connects with aria-labelledby for accessibility screen readers */}
        <h2 id="emissions-breakdown-heading" className="text-xl font-semibold">
          Emissions Breakdown
        </h2>
      </div>

      {/* Conditional rendering logic to display emissions table or empty state message */}
      {/* Checks both emissions existence and presence of child data before rendering table */}
      {emissions && emissions.children.length > 0 ? (
        // Container for emissions table with proper ARIA region role for screen readers
        // The region role helps assistive technologies understand this is a significant content area
        <div role="region" aria-label="Interactive emissions breakdown table">
          {/* Specialized table component that handles the complex emissions data visualization */}
          {/* Passes the complete emissions object to enable hierarchical data display */}
          <EmissionsTable emissions={emissions} />
        </div>
      ) : (
        // Empty state displayed when no emissions data is available or still loading
        // Uses semantic role="status" to inform screen readers of dynamic content state
        <div className="text-center py-6" role="status">
          {/* Primary message explaining the absence of detailed emission data */}
          {/* Uses appropriate color classes for light and dark theme compatibility */}
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No detailed emission data available.
          </p>
          {/* Secondary explanatory message providing context about data availability */}
          {/* Smaller text size and lighter color to indicate supplementary information */}
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Emission data may still be processing or unavailable for this product.
          </p>
        </div>
      )}
    </Card>
  );
};