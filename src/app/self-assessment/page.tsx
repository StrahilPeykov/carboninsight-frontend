export default function SelfAssessmentPage() {
  return <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>;
}

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Card from "../components/ui/Card";
// import Button from "../components/ui/Button";
// import { carbonFootprintApi } from "../../lib/api/carbonFootprintApi";

// export default function SelfAssessmentPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     industry_sector: "",
//     employee_count: "",
//     location: "",
//     annual_revenue: "",
//     has_environmental_policy: false,
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;

//     if (type === "checkbox") {
//       setFormData({
//         ...formData,
//         [name]: (e.target as HTMLInputElement).checked,
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: value,
//       });
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError("");

//     try {
//       const response = await carbonFootprintApi.createSelfAssessment(formData);
//       // Store the assessment ID in localStorage for the next steps
//       localStorage.setItem("currentAssessmentId", response.id);
//       router.push("/manufacturing-data");
//     } catch (err) {
//       setError("Failed to submit self-assessment. Please try again.");
//       console.error(err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
//           Self-Assessment
//         </h1>
//         <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
//           Step 1: Tell us about your organization and operations
//         </p>
//       </div>

//       <Card className="max-w-3xl mx-auto">
//         <h2 className="text-xl font-semibold mb-6">Company Information</h2>

//         {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label
//               htmlFor="industry_sector"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               Industry Sector
//             </label>
//             <select
//               id="industry_sector"
//               name="industry_sector"
//               value={formData.industry_sector}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
//             >
//               <option value="">Select Industry</option>
//               <option value="Manufacturing - Electronics">Manufacturing - Electronics</option>
//               <option value="Manufacturing - Automotive">Manufacturing - Automotive</option>
//               <option value="Manufacturing - Textiles">Manufacturing - Textiles</option>
//               <option value="Manufacturing - Food & Beverage">
//                 Manufacturing - Food & Beverage
//               </option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div>
//             <label
//               htmlFor="employee_count"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               Number of Employees
//             </label>
//             <select
//               id="employee_count"
//               name="employee_count"
//               value={formData.employee_count}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
//             >
//               <option value="">Select Employee Count</option>
//               <option value="1-10">1-10</option>
//               <option value="11-50">11-50</option>
//               <option value="51-250">51-250</option>
//               <option value="More than 250">More than 250</option>
//             </select>
//           </div>

//           <div>
//             <label
//               htmlFor="location"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               Primary Manufacturing Location
//             </label>
//             <input
//               type="text"
//               id="location"
//               name="location"
//               value={formData.location}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
//               placeholder="City, Country"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="annual_revenue"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               Annual Revenue (Optional)
//             </label>
//             <input
//               type="text"
//               id="annual_revenue"
//               name="annual_revenue"
//               value={formData.annual_revenue}
//               onChange={handleChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
//               placeholder="e.g. €5 million"
//             />
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="has_environmental_policy"
//               name="has_environmental_policy"
//               checked={formData.has_environmental_policy}
//               onChange={handleChange}
//               className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
//             />
//             <label
//               htmlFor="has_environmental_policy"
//               className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
//             >
//               Our company has an environmental policy
//             </label>
//           </div>

//           <div className="flex justify-end pt-6">
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? "Submitting..." : "Continue to Manufacturing Data"}
//             </Button>
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// }
