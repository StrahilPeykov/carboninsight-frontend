export default function LoadingSkeleton() {
  return (
    <div
      className="flex items-center justify-center min-h-[200px]"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red"
          aria-hidden="true"
        ></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
