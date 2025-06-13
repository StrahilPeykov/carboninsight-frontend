"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useTour } from '@/app/components/TourProvider';

export function useTourTrigger() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { startTour, isTourCompleted } = useTour();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Check if user just registered
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    
    // Check if there's already an active tour (persisted across pages)
    const activeTour = sessionStorage.getItem('activeTour');
    
    // If there's an active tour, let it continue
    if (activeTour) {
      return;
    }
    
    // Only start new tours if no tour is active
    if (isNewUser && !isTourCompleted('main-onboarding')) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        startTour('main-onboarding');
        localStorage.removeItem('isNewUser');
      }, 1000);
      return;
    }

    // Check if user has a company
    const hasCompany = localStorage.getItem('selected_company_id');

    // Only trigger context-specific tours if user has completed onboarding or has a company
    if (isTourCompleted('main-onboarding') || hasCompany) {
      // Product tour - only if user has a company
      if (pathname === '/product-list' && hasCompany && !isTourCompleted('product-list-tour')) {
        const hasSeenProductList = sessionStorage.getItem('hasSeenProductListTour') === 'true';
        if (!hasSeenProductList) {
          setTimeout(() => {
            startTour('product-list-tour');
            sessionStorage.setItem('hasSeenProductListTour', 'true');
          }, 500);
        }
      }

      // Company tour
      if (pathname === '/list-companies' && !isTourCompleted('company-tour')) {
        const hasSeenCompanyList = sessionStorage.getItem('hasSeenCompanyListTour') === 'true';
        if (!hasSeenCompanyList) {
          setTimeout(() => {
            startTour('company-tour');
            sessionStorage.setItem('hasSeenCompanyListTour', 'true');
          }, 500);
        }
      }
    }
  }, [isAuthenticated, user, pathname, startTour, isTourCompleted]);
}
