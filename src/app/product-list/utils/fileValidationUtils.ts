// Helper function to validate file type
// Checks file extension against allowed formats for product import
// Returns the validated extension or null if invalid
export const validateFileType = (fileName: string): string | null => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const validExtensions = ["aasx", "json", "xml", "csv", "xlsx"];
  
  if (!extension || !validExtensions.includes(extension)) {
    return null;
  }
  return extension;
};

// Helper function to check if file is empty
// Performs different validation checks based on file type
// Handles both binary and text-based file formats
export const checkFileEmpty = async (file: File, extension: string): Promise<boolean> => {
  if (extension === "xlsx") {
    return file.size < 500;
  }
  
  if (["csv", "json", "xml", "aasx"].includes(extension)) {
    const rawText = await file.text();
    const cleaned = rawText.replace(/\s+/g, "");
    
    if (cleaned.length === 0) return true;
    
    if (extension === "csv") {
      const nonEmptyLines = rawText
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
      return nonEmptyLines.length <= 1;
    }
  }
  
  return false;
};
