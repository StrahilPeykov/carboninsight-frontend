import { useState } from "react";

// Custom hook for managing AI advice modal state
// Handles the multi-step AI interaction workflow including confirmation, loading, and results
// Manages user input and AI-generated advice content for emission reduction recommendations
export function useAIModal() {
  // Product ID that is pending AI advice generation, null when no request is active
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  // Name of the product for which AI advice is being requested, used for display purposes
  const [pendingProductName, setPendingProductName] = useState<string>("");
  // Current step in the AI modal workflow: confirm user intent, show loading, or display results
  const [aiModalStep, setAiModalStep] = useState<"confirm" | "loading" | "result" | null>(null);
  // AI-generated advice content returned from the API, null when no advice has been generated
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  // User's custom prompt input for AI advice generation, allows personalized recommendations
  const [userPromptInput, setUserPromptInput] = useState<string>("");

  return {
    pendingProductId,
    setPendingProductId,
    pendingProductName,
    setPendingProductName,
    aiModalStep,
    setAiModalStep,
    aiAdvice,
    setAiAdvice,
    userPromptInput,
    setUserPromptInput,
  };
}