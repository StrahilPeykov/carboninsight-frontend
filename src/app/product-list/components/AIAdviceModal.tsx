"use client";

import ReactMarkdown from "react-markdown";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/ui/PopupModal";

/**
 * Props interface for the AIAdviceModal component
 * Defines all the required and optional properties for managing AI advice interactions
 */
interface AIAdviceModalProps {
  isOpen: boolean; // Controls modal visibility state
  onClose: () => void; // Callback function to close the modal
  step: "confirm" | "loading" | "result" | null; // Current step in the AI advice workflow
  productName: string; // Name of the product being analyzed
  aiAdvice: string | null; // Generated AI advice content (null during loading)
  userPromptInput: string; // User's custom question or prompt
  setUserPromptInput: (value: string) => void; // Function to update user prompt input
  onRequestAdvice: (prompt: string) => Promise<void>; // Async function to request AI advice
}

/**
 * AIAdviceModal Component
 * 
 * A multi-step modal interface for requesting and displaying AI-generated carbon footprint advice.
 * Implements a three-step workflow: confirmation → loading → results display.
 * 
 * Accessibility Features:
 * - Proper ARIA roles and live regions for dynamic content
 * - Screen reader announcements for state changes
 * - Keyboard navigation support through Modal component
 * - Semantic HTML structure with appropriate headings
 * - Focus management during step transitions
 * 
 * Privacy Considerations:
 * - Clear consent messaging before data sharing
 * - Transparent about data usage and retention policies
 * - Optional custom prompts for targeted advice
 * 
 * @param props - AIAdviceModalProps containing state and handlers
 * @returns Modal component with step-based AI advice interface
 */
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
  // Early return if modal is not open - prevents unnecessary rendering
  if (!isOpen) return null;

  return (
    <Modal
      // Dynamic title based on current step for clear context
      // Provides users with clear understanding of current modal state
      title={
        step === "confirm"
          ? "Send product data to AI?" // Confirmation step - requesting permission
          : step === "loading"
            ? "Generating AI Advice..." // Loading step - processing indication
            : `AI Advice for ${productName}` // Result step - displaying advice
      }
      onClose={onClose}
    >
      {/* Confirmation Step - User consent and custom prompt input */}
      {/* This step ensures user understands data sharing implications */}
      {step === "confirm" && (
        <>
          {/* Detailed consent and privacy information */}
          {/* Pre-formatted text with line breaks for clear information hierarchy */}
          <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-line mb-2">
            You're about to share product data for <strong>{productName}</strong> with our AI system
            to receive tailored carbon reduction recommendations.{"\n\n"}
            By clicking <strong>Send to AI</strong>, you consent to this use.{"\n\n"}
            You may also enter a specific question below to guide the response.{"\n\n"}
            <strong>No personal or sensitive data will be stored.</strong>
          </p>

          {/* Custom prompt input field for targeted AI advice */}
          {/* Screen reader accessible with proper labeling and description */}
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
          {/* Hidden description for screen readers */}
          {/* Provides additional context without cluttering visual interface */}
          <span id="ai-prompt-help" className="sr-only">
            Optional: Enter a specific question to guide the AI response
          </span>

          {/* Action buttons container */}
          {/* Right-aligned for standard modal button placement */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() =>
                // Use custom prompt if provided, otherwise use default comprehensive prompt
                // Default prompt ensures useful advice even without user input
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

      {/* Loading Step - Processing indication with accessibility features */}
      {/* Provides clear feedback during AI processing time */}
      {step === "loading" && (
        <div
          className="flex flex-col items-center justify-center py-8"
          role="status" // ARIA role for status updates
          aria-live="polite" // Announces loading state to screen readers
        >
          {/* Animated loading spinner with accessibility hiding */}
          {/* Visual indicator hidden from screen readers since text provides context */}
          <div
            className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            aria-hidden="true"
          />
          {/* Loading message for both visual and screen reader users */}
          <p className="text-sm text-gray-600">AI is thinking, please wait...</p>
        </div>
      )}

      {/* Results Step - Display generated AI advice */}
      {/* Only renders when advice is available to prevent empty states */}
      {step === "result" && aiAdvice && (
        <div
          className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100"
          role="main" // Indicates this is the primary content
          aria-labelledby="ai-advice-heading" // Links to heading for screen readers
        >
          {/* Hidden heading for screen reader navigation */}
          {/* Provides semantic structure without visual redundancy */}
          <h3 id="ai-advice-heading" className="sr-only">
            AI Recommendations
          </h3>
          {/* Markdown rendering for rich text formatting */}
          {/* Allows AI to provide structured advice with lists, emphasis, etc. */}
          <ReactMarkdown>{aiAdvice}</ReactMarkdown>
        </div>
      )}
    </Modal>
  );
}
