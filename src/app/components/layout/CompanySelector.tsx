// src/app/components/layout/CompanySelector.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Search, Settings, Users, Plus, Check, ChevronDown } from "lucide-react";

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
  isOpen,
  onToggle,
  onClose,
}: CleanCompanySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debug logging to help identify the issue
  useEffect(() => {
    console.log("CompanySelector Debug:", {
      currentCompanyId,
      currentCompanyIdType: typeof currentCompanyId,
      companiesLength: companies.length,
      companyIds: companies.map(c => ({ id: c.id, type: typeof c.id, name: c.name })),
    });
  }, [currentCompanyId, companies]);

  // Enhanced company finding with better type safety
  const currentCompany = companies.find(c => {
    // Ensure both values are strings and trim any whitespace
    const companyId = String(c.id).trim();
    const selectedId = String(currentCompanyId || '').trim();
    return companyId === selectedId;
  });

  // Additional debug for the found company
  useEffect(() => {
    console.log("Current company found:", currentCompany);
  }, [currentCompany]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
        setSearchQuery("");
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Company Selector Button - Subtle styling */}
      <button
        onClick={() => onToggle()}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium h-[44px] transition-all duration-200 min-w-[160px] max-w-[240px] border
          ${currentCompany 
            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30" 
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
          }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${currentCompany ? `Current company: ${currentCompany.name}. Click to change or manage company.` : "No company selected. Click to select a company."}`}
      >
        <div className="flex items-center min-w-0 flex-1">
          {currentCompany?.avatar ? (
            <img 
              src={currentCompany.avatar} 
              alt="" 
              className="w-4 h-4 rounded mr-2 flex-shrink-0"
            />
          ) : (
            <Building2 size={14} className={`mr-2 flex-shrink-0 ${currentCompany ? 'text-red-600 dark:text-red-400' : ''}`} aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            {currentCompany ? (
              <>
                <div className="truncate text-sm font-semibold leading-tight" title={currentCompany.name}>
                  {truncateCompanyName(currentCompany.name, 16)}
                </div>
                <div className="text-xs opacity-70 leading-tight -mt-0.5">
                  Selected Company
                </div>
              </>
            ) : (
              <span className="truncate text-sm">Select Company</span>
            )}
          </div>
        </div>
        <ChevronDown 
          size={12} 
          className={`ml-2 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${currentCompany ? 'text-red-600 dark:text-red-400' : ''}`} 
          aria-hidden="true" 
        />
      </button>

      {/* Clean Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200 dark:border-gray-700">
          
          {/* Quick Actions Header */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Settings clicked, currentCompanyId:", currentCompanyId);
                  if (currentCompanyId) {
                    onCompanySettings();
                    onClose();
                  }
                }}
                disabled={!currentCompanyId}
                className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Company Settings"
              >
                <Settings size={16} className="mb-1" />
                <span>Settings</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Users clicked, currentCompanyId:", currentCompanyId);
                  if (currentCompanyId) {
                    onManageUsers();
                    onClose();
                  }
                }}
                disabled={!currentCompanyId}
                className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Manage Users"
              >
                <Users size={16} className="mb-1" />
                <span>Users</span>
              </button>
              <button
                onClick={() => {
                  onCreateCompany();
                  onClose();
                }}
                className="flex flex-col items-center p-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30 rounded-md transition-colors"
                title="Create New Company"
              >
                <Plus size={16} className="mb-1" />
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Search (if many companies) */}
          {shouldShowSearch && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Company List */}
          <div className="py-2 max-h-64 overflow-y-auto">
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
            <div className="company-scroll">
              {filteredCompanies.length > 0 ? (
                <div className="px-2 space-y-1">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company.id)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md transition-colors group ${
                        company.id === currentCompanyId 
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" 
                          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {company.avatar ? (
                          <img 
                            src={company.avatar} 
                            alt="" 
                            className="w-5 h-5 rounded mr-3 flex-shrink-0"
                          />
                        ) : (
                          <Building2 size={16} className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                        )}
                        <span className="truncate font-medium" title={company.name}>
                          {company.name}
                        </span>
                      </div>
                      {company.id === currentCompanyId && (
                        <Check size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? 'No companies found' : 'No companies available'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Create Footer */}
          {companies.length === 0 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => {
                  onCreateCompany();
                  onClose();
                }}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-md transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Company
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}