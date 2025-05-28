import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ error }: { error: string }) {
  return (
    <div
      className="bg-red-100 text-red-700 border border-red-300 rounded-md p-4 flex items-start gap-3"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <strong className="font-semibold">Error:</strong>
        <span className="ml-1">{error}</span>
      </div>
    </div>
  );
}
