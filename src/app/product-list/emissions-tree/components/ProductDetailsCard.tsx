// Import React functional component type for TypeScript support
import { FC } from "react";
// Import reusable Card UI component for consistent styling and layout structure
import Card from "../../../components/ui/Card";
// Import Button UI component for standardized interactive elements
import Button from "../../../components/ui/Button";
// Import specific icons from lucide-react library for action buttons
import { Edit, Trash, FileDown, Sparkles } from "lucide-react";
// Import Product type definition from API layer for type safety
import { Product } from "@/lib/api/productApi";

// TypeScript interface defining the props required by the ProductDetailsCard component
// This ensures type safety and provides clear documentation of expected callback functions
// Each callback follows a consistent pattern of receiving the relevant data and event object
interface ProductDetailsCardProps {
  product: Product;
  isDeleting: boolean;
  onExport: (product: Product, event: React.MouseEvent) => void;
  onAIAdvice: (productId: string, productName: string, event: React.MouseEvent) => void;
  onEdit: (productId: string, event: React.MouseEvent) => void;
  onDelete: (product: Product, event: React.MouseEvent) => void;
}

// Functional component that renders a comprehensive card displaying product details and action buttons
// This component serves as the primary interface for viewing and interacting with product information
// It provides a responsive layout that adapts from single-column on mobile to multi-column on desktop
// The component includes accessibility features, semantic HTML structure, and comprehensive action capabilities
// The card layout is divided into three main sections: a header with the component title, a flexible
// content area containing product metadata and emissions data in two responsive columns, and a vertical
// action button panel on the right side. The component handles multiple product operations including
// data export for reporting purposes, AI-powered emission reduction recommendations, product editing
// navigation, and product deletion with confirmation workflows. All interactive elements include proper
// ARIA labels and keyboard navigation support for accessibility compliance. The responsive design ensures
// optimal viewing across device sizes with automatic layout adjustments and maintains consistent spacing
// and typography throughout the interface. Error handling and loading states are managed through prop
// values, and all user actions are delegated to parent components through well-defined callback functions.
export const ProductDetailsCard: FC<ProductDetailsCardProps> = ({
  product,
  isDeleting,
  onExport,
  onAIAdvice,
  onEdit,
  onDelete,
}) => {
  return (
    // Main card container using semantic section element with proper ARIA labeling
    // The mb-6 class provides consistent bottom margin spacing with other page components
    // The aria-labelledby attribute connects to the heading for screen reader accessibility
    // This Card component serves as the foundation wrapper that provides consistent styling
    // and layout structure throughout the application. The semantic section element helps
    // assistive technologies understand this is a distinct content area containing related
    // product information and actions. The margin bottom spacing ensures visual separation
    // from adjacent components while maintaining the overall page rhythm and hierarchy.
    <Card className="mb-6" as="section" aria-labelledby="product-details-heading">
      
      {/* Card header section containing the main heading for the product details */}
      {/* Uses flexbox layout to position heading and maintain space for potential future header actions */}
      <div className="flex justify-between items-center mb-4">
        {/* Primary heading for the product details section with semantic h2 element */}
        {/* ID attribute connects with aria-labelledby for accessibility screen readers */}
        <h2 id="product-details-heading" className="text-xl font-semibold">
          Product Details
        </h2>
      </div>
      
      {/* Main content container using responsive flexbox layout */}
      {/* Switches from column layout on mobile to row layout on medium screens and above */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Two-column detail section for product information */}
        {/* Takes up available space and switches between column and row layout based on screen size */}
        <div className="flex-1 flex flex-col md:flex-row gap-8">
          
          {/* Left column - basic product information */}
          {/* Contains core product metadata including supplier, manufacturer, SKU, and visibility status */}
          <div className="flex-1 space-y-2">
            
            {/* Supplier information display with fallback for missing data */}
            <div>
              <span className="font-semibold">Supplier:</span>
              <span className="ml-1">{product.supplier_name || "—"}</span>
            </div>
            
            {/* Manufacturer information display with fallback for missing data */}
            <div>
              <span className="font-semibold">Manufacturer:</span>
              <span className="ml-1">{product.manufacturer_name || "—"}</span>
            </div>
            
            {/* SKU (Stock Keeping Unit) display with accessibility abbreviation */}
            {/* Uses abbr element with title attribute to provide full term explanation */}
            <div>
              <span className="font-semibold"><abbr title="Stock Keeping Unit">SKU</abbr>:</span>
              <span className="ml-1">{product.sku || "—"}</span>
            </div>
            
            {/* Public visibility status with boolean to string conversion */}
            <div>
              <span className="font-semibold">Public:</span>
              <span className="ml-1">{product.is_public ? "Yes" : "No"}</span>
            </div>
            
            {/* Product description spanning full width with responsive grid behavior */}
            <div className="md:col-span-2">
              <span className="font-semibold">Description:</span>
              <span className="ml-1">{product.description}</span>
            </div>
          </div>

          {/* Right column - emissions metrics */}
          {/* Contains all carbon footprint related measurements with proper units and accessibility labels */}
          <div className="flex-1 space-y-2">
            
            {/* Total emissions display with comprehensive accessibility label */}
            {/* Uses aria-label to provide screen readers with full context including units */}
            <div>
              <span className="font-semibold">Total emissions:</span>
              <span className="ml-1" aria-label={`${product.emission_total} kilograms CO2 equivalent`}>
                {product.emission_total} kg CO₂-eq
              </span>
            </div>
            
            {/* Biogenic emissions display with specific type information for screen readers */}
            <div>
              <span className="font-semibold">Biogenic emissions:</span>
              <span className="ml-1" aria-label={`${product.emission_total_biogenic} kilograms CO2 equivalent biogenic`}>
                {product.emission_total_biogenic} kg CO₂-eq
              </span>
            </div>
            
            {/* Non-biogenic emissions display with specific type information for screen readers */}
            <div>
              <span className="font-semibold">Non-biogenic emissions:</span>
              <span className="ml-1" aria-label={`${product.emission_total_non_biogenic} kilograms CO2 equivalent non-biogenic`}>
                {product.emission_total_non_biogenic} kg CO₂-eq
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons for product operations */}
        {/* Responsive container that stacks horizontally on mobile and vertically on desktop */}
        <div className="flex flex-row md:flex-col justify-start gap-2 md:min-w-[120px]">
          
          {/* Export button - allows downloading product data */}
          {/* Uses outline variant for secondary action appearance with download icon */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs hover:cursor-pointer w-full"
            onClick={e => onExport(product, e)}
            aria-label={`Export data for ${product.name}`}
          >
            <FileDown className="w-3 h-3" aria-hidden="true" />
            <span>Export</span>
          </Button>

          {/* Ask AI button - triggers AI recommendation flow */}
          {/* Special gradient hover effect to highlight AI functionality */}
          <Button
            variant="outline"
            size="sm"
            className="group flex items-center gap-1 text-xs hover:bg-gradient-to-r from-purple-500 to-blue-500 hover:text-white hover:cursor-pointer w-full"
            onClick={e => onAIAdvice(product.id, product?.name ?? "", e)}
            aria-label={`Get AI recommendations for ${product.name}`}
          >
            <Sparkles className="w-3 h-3 text-purple-500 group-hover:text-white" aria-hidden="true" />
            Ask AI
          </Button>

          {/* Edit button - navigates to product edit page */}
          <Button
            size="sm"
            className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer w-full"
            onClick={e => onEdit(product.id, e)}
            aria-label={`Edit ${product.name}`}
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            Edit
          </Button>

          {/* Delete button - initiates product deletion flow */}
          {/* Button becomes non-interactive when deletion is in progress to prevent duplicate actions */}
          <Button
            size="sm"
            className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer w-full"
            onClick={e => onDelete(product, e)}
            disabled={isDeleting}
            aria-label={`Delete ${product.name}`}
          >
            <Trash className="w-4 h-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};