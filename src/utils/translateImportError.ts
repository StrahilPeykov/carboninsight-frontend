export function translateImportError(detail: string, field?: string): string {
    const lower = detail.toLowerCase();

    if (lower.includes("multipleobjectsreturned")) {
        return "This product matches more than one existing product. Please ensure it has a unique SKU or identifier.";
    }

    if (lower.includes("may not be null")) return "This field is required.";
    if (lower.includes("enter a valid number")) return "Must be a valid number.";
    if (lower.includes("not a valid choice")) return "Invalid choice provided.";
    if (lower.includes("expected a string but got")) return "Expected text format.";
    if (lower.includes("value is too long")) return "Too long.";
    if (lower.includes("value is too short")) return "Too short.";
    if (lower.includes("does not match the required pattern")) return "Invalid format.";
    if (lower.includes("file too large")) return "File is too large. Max 25MB.";
    if (lower.includes("unsupported file format")) return "Unsupported file type.";

    // Handle import count messages
    const match = lower.match(/successfully imported (\d+)/);
    const count = match ? parseInt(match[1], 10) : null;

    if (count !== null) {
        if (count === 0 && lower.includes("duplicate")) {
            return "No new products were imported. All rows were duplicates.";
        }
        return `Successfully imported ${count} product(s). Any duplicates were skipped.`;
    }
    return detail;
}
