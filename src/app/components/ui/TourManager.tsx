"use client";

import { useState } from "react";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  Book, 
  X, 
  HelpCircle,
  Lightbulb,
  Zap,
  ChevronRight,
  Award,
  Target
} from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import { useTour } from "@/hooks/useTour";

interface TourManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TourManager({ isOpen, onClose }: TourManagerProps) {
  const { 
    availableFlows, 
    completedFlows, 
    startFlow, 
    isActive, 
    currentOnboardingStep,
    isOnboardingComplete 
  } = useTour();
  
  const [selectedCategory, setSelectedCategory] = useState<"all" | "onboarding" | "features" | "advanced">("all");

  if (!isOpen) return null;

  // Categorize flows
  const categorizedFlows = {
    "onboarding": availableFlows.filter(flow => 
      flow.id.includes("onboarding") || 
      flow.id.includes("company-creation") || 
      flow.id.includes("dashboard-and-first") ||
      flow.id.includes("product-creation")
    ),
    "features": availableFlows.filter(flow => 
      flow.id.includes("product-management") || 
      flow.id.includes("advanced-features") ||
      flow.id.includes("ai-assistant")
    ),
    "advanced": availableFlows.filter(flow => 
      flow.id.includes("keyboard") || 
      flow.id.includes("shortcuts") || 
      flow.id.includes("mastery")
    ),
  };

  const getFlowsToShow = () => {
    if (selectedCategory === "all") return availableFlows;
    return categorizedFlows[selectedCategory] || [];
  };

  const getFlowIcon = (flowId: string) => {
    if (flowId.includes("onboarding") || flowId.includes("welcome")) return <Lightbulb size={16} />;
    if (flowId.includes("keyboard") || flowId.includes("shortcuts")) return <Zap size={16} />;
    if (flowId.includes("ai") || flowId.includes("advanced")) return <Target size={16} />;
    if (flowId.includes("product") || flowId.includes("dashboard")) return <Book size={16} />;
    return <HelpCircle size={16} />;
  };

  const getFlowStatus = (flowId: string) => {
    return completedFlows.has(flowId) ? "completed" : "available";
  };

  const getFlowStatusColor = (flowId: string) => {
    if (completedFlows.has(flowId)) {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
  };

  const resetTourProgress = () => {
    if (typeof window !== "undefined") {
      const confirmReset = confirm(
        "Are you sure you want to reset all tour progress?\n\n" +
        "This will:\n" +
        "• Mark all tours as incomplete\n" +
        "• Reset your onboarding progress\n" +
        "• Allow you to replay all tours from the beginning\n\n" +
        "This action cannot be undone."
      );
      
      if (confirmReset) {
        // Clear all tour-related localStorage data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes("completed_flows_") || key.includes("onboarding_step_")) {
            localStorage.removeItem(key);
          }
        });
        
        // Reload the page to reset state
        window.location.reload();
      }
    }
  };

  const getOnboardingProgress = () => {
    const onboardingFlows = categorizedFlows.onboarding;
    const completedOnboarding = onboardingFlows.filter(flow => completedFlows.has(flow.id)).length;
    return Math.round((completedOnboarding / onboardingFlows.length) * 100);
  };

  const canStartFlow = (flowId: string) => {
    const flow = availableFlows.find(f => f.id === flowId);
    if (!flow || isActive) return false;
    
    // Check prerequisites
    if (flow.prerequisites) {
      return flow.prerequisites.every(req => completedFlows.has(req));
    }
    
    return true;
  };

  const getFlowDescription = (flow: any) => {
    if (completedFlows.has(flow.id)) {
      return `✅ ${flow.description}`;
    }
    
    if (!canStartFlow(flow.id)) {
      const missingPrereqs = flow.prerequisites?.filter((req: string) => !completedFlows.has(req)) || [];
      if (missingPrereqs.length > 0) {
        return `🔒 Complete other tours first: ${missingPrereqs.join(", ")}`;
      }
    }
    
    return flow.description;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden mx-4">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Book className="text-blue-600" />
              Guided Tours
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Master CarbonInsight with interactive step-by-step guides
            </p>
          </div>
          <Button variant="icon" onClick={onClose} ariaLabel="Close tour manager">
            <X size={24} />
          </Button>
        </div>

        {/* Progress Overview */}
        {!isOnboardingComplete && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-green-600" />
                Onboarding Progress
              </h3>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Step {currentOnboardingStep} of 6
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(currentOnboardingStep / 6) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {isOnboardingComplete 
                ? "🎉 Onboarding complete! Explore advanced features below."
                : "Complete the onboarding flow to unlock all features"}
            </p>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {[
            { id: "all", label: "All Flows", count: availableFlows.length, icon: Book },
            { id: "onboarding", label: "Getting Started", count: categorizedFlows["onboarding"].length, icon: Lightbulb },
            { id: "features", label: "Features", count: categorizedFlows["features"].length, icon: Target },
            { id: "advanced", label: "Advanced", count: categorizedFlows["advanced"].length, icon: Zap },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedCategory === category.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
              }`}
            >
              <category.icon size={16} />
              {category.label}
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tours list */}
        <div className="overflow-y-auto max-h-96 bg-white dark:bg-gray-900">
          {getFlowsToShow().length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Book size={32} className="mx-auto mb-3 opacity-50" />
              <p>No tours in this category</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {getFlowsToShow()
                .sort((a, b) => b.priority - a.priority)
                .map((flow) => {
                  const status = getFlowStatus(flow.id);
                  const isCompleted = status === "completed";
                  const canStart = canStartFlow(flow.id);

                  return (
                    <div
                      key={flow.id}
                      className={`flex items-start gap-4 p-4 border rounded-xl transition-all hover:shadow-md ${
                        isCompleted 
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10" 
                          : canStart 
                            ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 hover:border-blue-300"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                      }`}
                    >
                      {/* Icon and status indicator */}
                      <div className="flex-shrink-0 relative">
                        <div className={`p-3 rounded-xl ${
                          isCompleted 
                            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : canStart
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                        }`}>
                          {getFlowIcon(flow.id)}
                        </div>
                        {isCompleted && (
                          <CheckCircle 
                            size={16} 
                            className="absolute -top-1 -right-1 text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 rounded-full"
                          />
                        )}
                      </div>

                      {/* Flow details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {flow.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getFlowStatusColor(flow.id)}`}>
                            {isCompleted ? (
                              <>
                                <CheckCircle size={10} />
                                Completed
                              </>
                            ) : canStart ? (
                              <>
                                <Play size={10} />
                                Available
                              </>
                            ) : (
                              <>
                                <Clock size={10} />
                                Locked
                              </>
                            )}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                          {getFlowDescription(flow)}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {flow.steps.length} steps
                          </span>
                          <span className="flex items-center gap-1">
                            <Award size={10} />
                            Priority: {flow.priority}
                          </span>
                          {flow.prerequisites && flow.prerequisites.length > 0 && (
                            <span className="flex items-center gap-1">
                              🔒 Prerequisites required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : canStart ? "primary" : "secondary"}
                          onClick={() => {
                            if (canStart || isCompleted) {
                              startFlow(flow.id, true);
                              onClose();
                            }
                          }}
                          disabled={!canStart && !isCompleted}
                          className="flex items-center gap-2 min-w-[100px] justify-center"
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw size={14} />
                              Replay
                            </>
                          ) : canStart ? (
                            <>
                              <Play size={14} />
                              Start
                            </>
                          ) : (
                            <>
                              <Clock size={14} />
                              Locked
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Enhanced footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-green-600 dark:text-green-400">{completedFlows.size}</span> of{" "}
                <span className="font-semibold">{availableFlows.length}</span> tours completed
              </div>
              
              {!isOnboardingComplete && (
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  🚀 {6 - currentOnboardingStep} steps left to complete onboarding
                </div>
              )}
            </div>
            
            {completedFlows.size > 0 && (
              <div className="flex items-center gap-2">
                {isOnboardingComplete && (
                  <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                    <Award size={16} />
                    Expert Level Unlocked!
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTourProgress}
                  className="flex items-center gap-1 text-xs"
                >
                  <RotateCcw size={12} />
                  Reset All Progress
                </Button>
              </div>
            )}
          </div>

          {/* Overall progress bar */}
          {availableFlows.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Overall Progress
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((completedFlows.size / availableFlows.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedFlows.size / availableFlows.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick tips */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Pro Tip:</strong> Tours automatically continue when you complete actions. 
                You can also restart any tour at any time to refresh your knowledge!
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
