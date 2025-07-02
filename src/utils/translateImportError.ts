// This utility file provides functions to translate API error messages 
// into user-friendly formats for product import operations

// Map of error patterns to user-friendly messages
// Each key is a lowercase string that might appear in an error message
// The corresponding value is the user-friendly message to display
const ERROR_PATTERNS: Record<string, string> = {
  "multipleobjectsreturned": "This product matches more than one existing product. Please ensure it has a unique SKU or identifier.",
  "may not be null": "This field is required.",
  "enter a valid number": "Must be a valid number.",
  "not a valid choice": "Invalid choice provided.",
  "expected a string but got": "Expected text format.",
  "value is too long": "Too long.",
  "value is too short": "Too short.",
  "does not match the required pattern": "Invalid format.",
  "file too large": "File is too large. Max 25MB.",
  "unsupported file format": "Unsupported file type."
};

// Parses success messages that contain import counts
// Extracts the number of products imported and returns a user-friendly message
// Returns null if the message doesn't match the expected pattern
function parseImportCount(detail: string): string | null {
  // Convert to lowercase for case-insensitive matching
  const lower = detail.toLowerCase();
  // Look for patterns like "successfully imported 5"
  const match = lower.match(/successfully imported (\d+)/);
  // Extract the count or set to null if no match
  const count = match ? parseInt(match[1], 10) : null;

  // Return null if no match found
  if (count === null) return null;
  
  // Handle the case of zero imports due to duplicates
  if (count === 0 && lower.includes("duplicate")) {
    return "No new products were imported. All rows were duplicates.";
  }
  // Standard success message with count
  return `Successfully imported ${count} product(s). Any duplicates were skipped.`;
}

// Main function to translate error messages into user-friendly format
// Takes the original error message and optional field name
// Returns a user-friendly message based on pattern matching
export function translateImportError(detail: string, field?: string): string {
  // Convert to lowercase for case-insensitive matching
  const lower = detail.toLowerCase();
  
  // Check if the error message contains any known patterns
  // and return the corresponding user-friendly message
  for (const [pattern, message] of Object.entries(ERROR_PATTERNS)) {
    if (lower.includes(pattern)) {
      return message;
    }
  }
  
  // Check if this is a success message with import count
  const importMessage = parseImportCount(detail);
  if (importMessage) {
    return importMessage;
  }
  
  // If no patterns matched, return the original message as fallback
  return detail;
}
