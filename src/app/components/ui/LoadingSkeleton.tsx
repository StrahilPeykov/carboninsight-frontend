export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded-md animate-pulse" />
      ))}
    </div>
  );
}
