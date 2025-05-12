export default function ResultsPage() {
  return <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>;
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Card from "../components/ui/Card";
// import Button from "../components/ui/Button";
// import Link from "next/link";
// import { carbonFootprintApi } from "../../lib/api/carbonFootprintApi";

// interface Recommendation {
//   id: string;
//   title: string;
//   description: string;
//   potential_reduction: number;
// }

// interface CarbonFootprintResult {
//   id: string;
//   total_carbon_footprint: number;
//   carbon_intensity: number;
//   circularity_index: number;
//   direct_operations_emissions: number;
//   purchased_electricity_emissions: number;
//   supply_chain_emissions: number;
//   dpp_generated: boolean;
//   dpp_file_path: string | null;
//   recommendations: Recommendation[];
// }

// export default function ResultsPage() {
//   const router = useRouter();
//   const [selfAssessmentId, setSelfAssessmentId] = useState("");
//   const [result, setResult] = useState<CarbonFootprintResult | null>(null);
//   const [isGeneratingDPP, setIsGeneratingDPP] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Get the current assessment ID from localStorage
//     const assessmentId = localStorage.getItem("currentAssessmentId");
//     if (assessmentId) {
//       setSelfAssessmentId(assessmentId);
//       fetchResults(parseInt(assessmentId));
//     } else {
//       // Redirect to self-assessment if no assessment ID is found
//       router.push("/self-assessment");
//     }
//   }, [router]);

//   const fetchResults = async (assessmentId: number) => {
//     setIsLoading(true);
//     try {
//       const results = await carbonFootprintApi.getResults(assessmentId);
//       if (results && results.length > 0) {
//         setResult(results[0]);
//       } else {
//         // If no results are available, try to calculate now
//         try {
//           const calculatedResult = await carbonFootprintApi.calculateFootprint(assessmentId);
//           setResult(calculatedResult);
//         } catch (calcError) {
//           setError("Failed to calculate carbon footprint. Please check your input data.");
//           console.error(calcError);
//         }
//       }
//     } catch (err) {
//       setError("Failed to load results. Please try again.");
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGenerateDPP = async () => {
//     if (!selfAssessmentId) return;

//     setIsGeneratingDPP(true);
//     try {
//       const response = await carbonFootprintApi.generateDPP(parseInt(selfAssessmentId));
//       // Update result with new DPP information
//       setResult(response.result);
//     } catch (err) {
//       setError("Failed to generate Digital Product Passport. Please try again.");
//       console.error(err);
//     } finally {
//       setIsGeneratingDPP(false);
//     }
//   };

//   const handleDownloadDPP = async () => {
//     if (!result || !result.dpp_file_path) return;

//     // In a real implementation, this would navigate to a download endpoint
//     alert("Download functionality to be implemented. DPP path: " + result.dpp_file_path);
//   };

//   if (isLoading) {
//     return (
//       <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <p className="text-xl">Loading results...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
//           Carbon Footprint Results
//         </h1>
//         <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
//           Step 4: View your results and download your Digital Product Passport
//         </p>
//       </div>

//       {error && (
//         <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-100 text-red-800 rounded-md">{error}</div>
//       )}

//       {result ? (
//         <div className="grid gap-8 md:grid-cols-2">
//           <Card className="md:col-span-2">
//             <h2 className="text-xl font-semibold mb-6">Carbon Footprint Overview</h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                   Total Carbon Footprint
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
//                   {result.total_carbon_footprint.toFixed(1)}
//                 </p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">tons CO₂e</p>
//               </div>

//               <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                   Carbon Intensity
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
//                   {result.carbon_intensity.toFixed(1)}
//                 </p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">kg CO₂e per unit</p>
//               </div>

//               <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                   Circularity Index
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
//                   {result.circularity_index.toFixed(0)}%
//                 </p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">recycled materials</p>
//               </div>
//             </div>

//             {/* Placeholder chart */}
//             <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
//               <p className="text-gray-500 dark:text-gray-400">Carbon footprint breakdown chart</p>
//             </div>

//             <div className="flex flex-wrap justify-center space-x-4">
//               {result.dpp_generated ? (
//                 <Button onClick={handleDownloadDPP}>Download Digital Product Passport</Button>
//               ) : (
//                 <Button onClick={handleGenerateDPP} disabled={isGeneratingDPP}>
//                   {isGeneratingDPP ? "Generating..." : "Generate Digital Product Passport"}
//                 </Button>
//               )}
//               <Button variant="outline">Export as CSV</Button>
//               <Button variant="outline">Print Report</Button>
//             </div>
//           </Card>

//           <Card>
//             <h2 className="text-xl font-semibold mb-6">Emissions by Category</h2>

//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600 dark:text-gray-400">Direct Operations</span>
//                 <span className="text-sm font-medium">
//                   {result.direct_operations_emissions.toFixed(1)} tons CO₂e
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//                 <div
//                   className="bg-green-600 h-2.5 rounded-full"
//                   style={{
//                     width: `${((result.direct_operations_emissions / result.total_carbon_footprint) * 100).toFixed(0)}%`,
//                   }}
//                 ></div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600 dark:text-gray-400">
//                   Purchased Electricity
//                 </span>
//                 <span className="text-sm font-medium">
//                   {result.purchased_electricity_emissions.toFixed(1)} tons CO₂e
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//                 <div
//                   className="bg-green-600 h-2.5 rounded-full"
//                   style={{
//                     width: `${((result.purchased_electricity_emissions / result.total_carbon_footprint) * 100).toFixed(0)}%`,
//                   }}
//                 ></div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600 dark:text-gray-400">Supply Chain</span>
//                 <span className="text-sm font-medium">
//                   {result.supply_chain_emissions.toFixed(1)} tons CO₂e
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//                 <div
//                   className="bg-green-600 h-2.5 rounded-full"
//                   style={{
//                     width: `${((result.supply_chain_emissions / result.total_carbon_footprint) * 100).toFixed(0)}%`,
//                   }}
//                 ></div>
//               </div>
//             </div>
//           </Card>

//           <Card>
//             <h2 className="text-xl font-semibold mb-6">AI Reduction Recommendations</h2>

//             <div className="space-y-4">
//               {result.recommendations && result.recommendations.length > 0 ? (
//                 result.recommendations.map(rec => (
//                   <div
//                     key={rec.id}
//                     className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-900"
//                   >
//                     <h3 className="font-medium text-green-800 dark:text-green-400">{rec.title}</h3>
//                     <p className="text-sm text-green-700 dark:text-green-300 mt-1">
//                       {rec.description}
//                     </p>
//                     <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                       Potential reduction: {rec.potential_reduction.toFixed(1)} tons CO₂e
//                     </p>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-center text-gray-500 dark:text-gray-400">
//                   No recommendations available yet.
//                 </p>
//               )}
//             </div>
//           </Card>

//           <div className="md:col-span-2 flex justify-between mt-6">
//             <Link href="/supply-chain-data">
//               <Button variant="outline">Back to Supply Chain</Button>
//             </Link>
//             <Link href="/">
//               <Button>Back to Home</Button>
//             </Link>
//           </div>
//         </div>
//       ) : (
//         <div className="text-center">
//           <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
//             No results available. Please complete the assessment process to see your carbon
//             footprint results.
//           </p>
//           <Link href="/self-assessment">
//             <Button>Start Assessment</Button>
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// }
