interface AccessibleTableProps {
  caption: string;
  children: React.ReactNode;
  className?: string;
}

export default function AccessibleTable({
  caption,
  children,
  className = "",
}: AccessibleTableProps) {
  return (
    <div className="w-full">
      {/* Scrollable container with proper ARIA region for large tables */}
      <div
        className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        role="region" // ARIA role for scrollable content region
        aria-label={caption} // Accessible label describing table content
        style={{ maxWidth: "100vw" }} // Prevent overflow beyond viewport
      >
        {/* Main table element with responsive styling */}
        <table className={`min-w-full table-auto ${className}`} style={{ minWidth: "600px" }}>
          {/* Hidden caption for screen readers */}
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}
