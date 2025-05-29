interface AccessibleTableProps {
  caption: string;
  children: React.ReactNode;
  className?: string;
}

export default function AccessibleTable({ caption, children, className = "" }: AccessibleTableProps) {
  return (
    <div className="overflow-x-auto" role="region" aria-label={caption}>
      <table className={`min-w-full table-auto ${className}`}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
