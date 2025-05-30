"use client";

import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { useState } from "react";

export default function UITestPage() {
  const [state, setState] = useState<"loading" | "error" | "empty" | "success">("loading");

  return (
    <div className="p-6">
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setState("loading")}>Loading</button>
        <button onClick={() => setState("error")}>Error</button>
        <button onClick={() => setState("empty")}>Empty</button>
        <button onClick={() => setState("success")}>Success</button>
      </div>

      {state === "loading" && <LoadingSkeleton />}
      {state === "error" && <ErrorBanner error="Something went wrong!" />}
      {state === "empty" && <EmptyState message="Nothing to display." />}
      {state === "success" && <div className="text-green-600">✅ Everything is working!</div>}
    </div>
  );
}
