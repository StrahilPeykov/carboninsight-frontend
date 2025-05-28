export default function LoadingSkeleton({
  count = 3,
  message = "Loading content, please wait...",
}: {
  count?: number;
  message?: string;
}) {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{message}</span>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded-md animate-pulse" aria-hidden="true" />
      ))}
    </div>
  );
}
