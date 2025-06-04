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
      <div 
        className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" 
        role="region" 
        aria-label={caption}
        style={{ maxWidth: '100vw' }}
      >
        <table className={`min-w-full table-auto ${className}`} style={{ minWidth: '600px' }}>
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}
