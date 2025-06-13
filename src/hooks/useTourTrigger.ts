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

    // Check if user just registered (you might want to add a flag in your auth context)
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    
    if (isNewUser && !isTourCompleted('main-onboarding')) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        startTour('main-onboarding');
        localStorage.removeItem('isNewUser');
      }, 1000);
    }

    // Trigger context-specific tours
    if (pathname === '/product-list' && !isTourCompleted('product-list-tour')) {
      const hasSeenDashboard = localStorage.getItem('hasSeenDashboard') === 'true';
      if (hasSeenDashboard) {
        setTimeout(() => {
          startTour('product-list-tour');
        }, 500);
      }
    }

    if (pathname === '/list-companies' && !isTourCompleted('company-tour')) {
      setTimeout(() => {
        startTour('company-tour');
      }, 500);
    }
  }, [isAuthenticated, user, pathname, startTour, isTourCompleted]);

  // Mark dashboard as seen
  useEffect(() => {
    if (pathname === '/dashboard') {
      localStorage.setItem('hasSeenDashboard', 'true');
    }
  }, [pathname]);
}
