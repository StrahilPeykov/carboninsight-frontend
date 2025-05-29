export default function LoadingSkeleton({
  count = 3,
  message = "Loading content, please wait...",
  className = "",
}: {
  count?: number;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`space-y-4 ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={message}
    >
      <span className="sr-only">{message}</span>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
          aria-hidden="true"
        >
          <span className="sr-only">
            Loading item {i + 1} of {count}
          </span>
        </div>
      ))}
    </div>
  );
}
