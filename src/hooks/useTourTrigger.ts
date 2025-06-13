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
    
    if (isNewUser && !isTourCompleted('main-onboarding')) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        startTour('main-onboarding');
        localStorage.removeItem('isNewUser');
      }, 1000);
      return; // Don't trigger other tours if we're showing onboarding
    }

    // Check if user has a company
    const hasCompany = localStorage.getItem('selected_company_id');

    // Trigger context-specific tours only if user has completed onboarding
    if (isTourCompleted('main-onboarding') || hasCompany) {
      // Only trigger product tour if user has a company and is on product list page
      if (pathname === '/product-list' && hasCompany && !isTourCompleted('product-list-tour')) {
        const hasSeenProductList = localStorage.getItem('hasSeenProductList') === 'true';
        if (!hasSeenProductList) {
          setTimeout(() => {
            startTour('product-list-tour');
            localStorage.setItem('hasSeenProductList', 'true');
          }, 500);
        }
      }

      // Only trigger company tour if on companies page and not completed
      if (pathname === '/list-companies' && !isTourCompleted('company-tour')) {
        const hasSeenCompanyList = localStorage.getItem('hasSeenCompanyList') === 'true';
        if (!hasSeenCompanyList) {
          setTimeout(() => {
            startTour('company-tour');
            localStorage.setItem('hasSeenCompanyList', 'true');
          }, 500);
        }
      }
    }
  }, [isAuthenticated, user, pathname, startTour, isTourCompleted]);

  // Mark pages as seen for tour triggering
  useEffect(() => {
    if (pathname === '/dashboard') {
      localStorage.setItem('hasSeenDashboard', 'true');
    } else if (pathname === '/product-list') {
      localStorage.setItem('hasSeenProductList', 'true');
    } else if (pathname === '/list-companies') {
      localStorage.setItem('hasSeenCompanyList', 'true');
    }
  }, [pathname]);
}
