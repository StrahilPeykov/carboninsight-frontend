// Helper function to validate environment requirements
// Checks for required environment variables and authentication tokens
// Returns validation status and all required values for API operations
export const validateEnvironment = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const company = typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
  
  return { API_URL, token, company, isValid: !!(API_URL && token && company) };
};

// Helper function to update live region announcements for accessibility
// Provides real-time updates to screen readers and assistive technologies
// Used throughout the application for announcing dynamic content changes
export const updateLiveRegion = (regionId: string, message: string) => {
  const liveRegion = document.getElementById(regionId);
  if (liveRegion) {
    liveRegion.textContent = message;
  }
};

// Helper function to create and trigger file download
// Handles blob conversion, download link creation, and cleanup
// Provides a consistent interface for downloading files across the application
export const triggerFileDownload = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
};
