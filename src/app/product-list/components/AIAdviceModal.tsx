"use client";

import ReactMarkdown from "react-markdown";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/ui/PopupModal";

interface AIAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: "confirm" | "loading" | "result" | null;
  productName: string;
  aiAdvice: string | null;
  userPromptInput: string;
  setUserPromptInput: (value: string) => void;
  onRequestAdvice: (prompt: string) => Promise<void>;
}

export default function AIAdviceModal({
  isOpen,
  onClose,
  step,
  productName,
  aiAdvice,
  userPromptInput,
  setUserPromptInput,
  onRequestAdvice,
}: AIAdviceModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      title={
        step === "confirm"
          ? "Send product data to AI?"
          : step === "loading"
            ? "Generating AI Advice..."
            : `AI Advice for ${productName}`
      }
      onClose={onClose}
    >
      {step === "confirm" && (
        <>
          <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-line mb-2">
            You're about to share product data for <strong>{productName}</strong> with our AI system
            to receive tailored carbon reduction recommendations.{"\n\n"}
            By clicking <strong>Send to AI</strong>, you consent to this use.{"\n\n"}
            You may also enter a specific question below to guide the response.{"\n\n"}
            <strong>No personal or sensitive data will be stored.</strong>
          </p>

          <label htmlFor="ai-prompt-input" className="sr-only">
            Enter your specific question for AI analysis
          </label>
          <textarea
            id="ai-prompt-input"
            value={userPromptInput}
            onChange={e => setUserPromptInput(e.target.value)}
            placeholder="Ask a specific question about this product..."
            className="w-full border rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            aria-describedby="ai-prompt-help"
          />
          <span id="ai-prompt-help" className="sr-only">
            Optional: Enter a specific question to guide the AI response
          </span>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() =>
                onRequestAdvice(
                  userPromptInput ||
                    "Please analyze this product and suggest solutions to reduce carbon footprint. (in 150 words)"
                )
              }
            >
              Send to AI
            </Button>
          </div>
        </>
      )}

      {step === "loading" && (
        <div
          className="flex flex-col items-center justify-center py-8"
          role="status"
          aria-live="polite"
        >
          <div
            className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-600">AI is thinking, please wait...</p>
        </div>
      )}

      {step === "result" && aiAdvice && (
        <div
          className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100"
          role="main"
          aria-labelledby="ai-advice-heading"
        >
          <h3 id="ai-advice-heading" className="sr-only">
            AI Recommendations
          </h3>
          <ReactMarkdown>{aiAdvice}</ReactMarkdown>
        </div>
      )}
    </Modal>
  );
}
