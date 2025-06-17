"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Search, Settings, Users, Plus, Check, ChevronDown, Share2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  avatar?: string;
}

interface CleanCompanySelectorProps {
  companies: Company[];
  currentCompanyId: string | null;
  onCompanySelect: (companyId: string) => void;
  onCreateCompany: () => void;
  onCompanySettings: () => void;
  onManageUsers: () => void;
  onDataSharing: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function CleanCompanySelector({
  companies,
  currentCompanyId,
  onCompanySelect,
  onCreateCompany,
  onCompanySettings,
  onManageUsers,
  onDataSharing,
  isOpen,
  onToggle,
  onClose,
}: CleanCompanySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced company finding with better type safety
  const currentCompany = companies.find(c => {
    const companyId = String(c.id).trim();
    const selectedId = String(currentCompanyId || "").trim();
    return companyId === selectedId;
  });

  const shouldShowSearch = companies.length > 8;

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle company selection
  const handleCompanySelect = (companyId: string) => {
    console.log("Selecting company:", companyId);
    onCompanySelect(companyId);
    onClose();
    setSearchQuery("");
  };

  // Handle navigation with tour support
  const handleNavigation = (path: string, tourAction?: string) => {
    const activeTour = sessionStorage.getItem("activeTour");
    if (activeTour && tourAction) {
      window.dispatchEvent(
        new CustomEvent("tourAction", {
          detail: { action: tourAction },
        })
      );
    }
    // The navigation will be handled by the parent component's onClose and navigation
    onClose();
  };

  // Smart truncation for company names
  const truncateCompanyName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && shouldShowSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, shouldShowSearch]);

  // Close dropdown when clicking outside (but not during tour)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if tour is active
      const isTourActive = document.body.classList.contains("tour-active");
      const activeTour = sessionStorage.getItem("activeTour");

      // Don't auto-close during tour
      if (isTourActive && activeTour === "main-onboarding") {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Company Selector Button */}
      <button
        onClick={() => onToggle()}
        className={`company-selector-button flex items-center px-3 py-2 rounded-md text-sm font-medium h-[44px] transition-all duration-200 min-w-0 max-w-full border
          ${
            currentCompany
              ? "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
          } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
        style={{
          width: "clamp(120px, 20vw, 200px)",
          maxWidth: "100%",
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${currentCompany ? `Current company: ${currentCompany.name}. Click to change or manage company.` : "No company selected. Click to select a company."}`}
      >
        <div className="flex items-center min-w-0 flex-1 overflow-hidden">
          {currentCompany?.avatar ? (
            <img
              src={currentCompany.avatar}
              alt=""
              className="w-4 h-4 rounded mr-2 flex-shrink-0"
            />
          ) : (
            <Building2
              size={14}
              className={`mr-2 flex-shrink-0 ${currentCompany ? "text-gray-600 dark:text-gray-400" : "text-gray-500"}`}
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            {currentCompany ? (
              <>
                <div
                  className="truncate text-sm font-semibold leading-tight min-w-0"
                  title={currentCompany.name}
                >
                  {currentCompany.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight -mt-0.5 truncate">
                  <span className="sm:hidden">Company</span>
                  <span className="hidden sm:inline">Current Company</span>
                </div>
              </>
            ) : (
              <span className="truncate text-sm">
                <span className="sm:hidden">Select</span>
                <span className="hidden sm:inline">Select Company</span>
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          size={12}
          className={`ml-1 sm:ml-2 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} text-gray-500`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[10001] border border-gray-200 dark:border-gray-700">
          {/* Clear Header Section */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select Company
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={e => {
                  e.preventDefault();
                  if (currentCompanyId) {
                    onCompanySettings();
                    onClose();
                  } else {
                    console.log("No company selected for settings");
                  }
                }}
                disabled={!currentCompanyId}
                className="company-settings-button flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Company Settings"
              >
                <Settings size={14} className="mb-1" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden text-[10px]">Set</span>
              </button>
              <button
                onClick={e => {
                  e.preventDefault();
                  if (currentCompanyId) {
                    onManageUsers();
                    onClose();
                  } else {
                    console.log("No company selected for users");
                  }
                }}
                disabled={!currentCompanyId}
                className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Manage Users"
              >
                <Users size={14} className="mb-1" />
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden text-[10px]">Use</span>
              </button>
              <button
                onClick={e => {
                  e.preventDefault();
                  if (currentCompanyId) {
                    onDataSharing();
                    onClose();
                  } else {
                    console.log("No company selected for data sharing");
                  }
                }}
                disabled={!currentCompanyId}
                className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Data Sharing Requests"
              >
                <Share2 size={14} className="mb-1" />
                <span className="hidden sm:inline">Sharing</span>
                <span className="sm:hidden text-[10px]">Shr</span>
              </button>
              <button
                onClick={() => {
                  onCreateCompany();
                  onClose();
                }}
                className="flex flex-col items-center p-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30 rounded-md transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-800"
                title="Create New Company"
                data-tour-target="create-company"
              >
                <Plus size={14} className="mb-1" />
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden text-[10px]">New</span>
              </button>
            </div>
          </div>

          {/* Search (if many companies) */}
          {shouldShowSearch && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Company List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Clear header above company list */}
            {filteredCompanies.length > 0 && (
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                {filteredCompanies.length === 1
                  ? "Your company"
                  : `${filteredCompanies.length} companies available`}
              </div>
            )}

            <style jsx>{`
              .company-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .company-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .company-scroll::-webkit-scrollbar-thumb {
                background: rgba(156, 163, 175, 0.5);
                border-radius: 3px;
              }
              .company-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(156, 163, 175, 0.7);
              }
            `}</style>
            <div className="company-scroll py-1">
              {filteredCompanies.length > 0 ? (
                <div className="px-1 space-y-1">
                  {filteredCompanies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company.id)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md transition-colors group min-w-0 ${
                        company.id === currentCompanyId
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <Building2
                          size={16}
                          className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                        />
                        <span className="truncate font-medium min-w-0 flex-1" title={company.name}>
                          {company.name}
                        </span>
                      </div>
                      {company.id === currentCompanyId && (
                        <Check
                          size={16}
                          className="text-red-600 dark:text-red-400 flex-shrink-0 ml-2"
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? (
                    <>
                      <Building2 size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No companies found</p>
                      <p className="text-xs">Try adjusting your search</p>
                    </>
                  ) : (
                    <>
                      <Building2 size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No companies available</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Empty state with create action */}
          {companies.length === 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
              <div className="text-center">
                <button
                  onClick={() => {
                    onCreateCompany();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red hover:bg-red-700 rounded-md transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Create Your First Company
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
