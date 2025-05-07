const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function for handling API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// API functions for carbon footprint data
export const carbonFootprintApi = {
  // Self-assessment
  createSelfAssessment: (data: any) => 
    fetchAPI('/self-assessments/', { method: 'POST', body: JSON.stringify(data) }),
  
  // Manufacturing data
  createManufacturingData: (data: any) => 
    fetchAPI('/manufacturing-data/', { method: 'POST', body: JSON.stringify(data) }),
  
  // Supply chain
  createSupplyChain: (data: any) => 
    fetchAPI('/supply-chains/', { method: 'POST', body: JSON.stringify(data) }),
  
  // Supplier
  addSupplier: (data: any) => 
    fetchAPI('/suppliers/', { method: 'POST', body: JSON.stringify(data) }),
  
  // Complete assessment
  submitCompleteAssessment: (data: any) => 
    fetchAPI('/complete-assessments/', { method: 'POST', body: JSON.stringify(data) }),
  
  // Calculate carbon footprint
  calculateFootprint: (assessmentId: number) => 
    fetchAPI('/carbon-footprints/calculate/', { 
      method: 'POST', 
      body: JSON.stringify({ assessment_id: assessmentId }) 
    }),
  
  // Generate DPP
  generateDPP: (assessmentId: number) => 
    fetchAPI('/carbon-footprints/generate_dpp/', { 
      method: 'POST', 
      body: JSON.stringify({ assessment_id: assessmentId }) 
    }),
  
  // Get results
  getResults: (assessmentId: number) => 
    fetchAPI(`/carbon-footprints/?self_assessment=${assessmentId}`)
};