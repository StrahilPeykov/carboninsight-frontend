'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from "@/app/components/ui/Button";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };

    // Check on initial load
    checkLoginStatus();

    // Set up event listener for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentAssessmentId');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white shadow-sm dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src="/brainport-logo-white.webp"
                  alt="Carbon Footprint Calculator" 
                  width={32} 
                  height={32} 
                  className="hidden dark:block"
                />
                <Image
                  src="/brainport-logo.webp"
                  alt="Carbon Footprint Calculator"
                  width={32}
                  height={32}
                  className="block dark:hidden"
                />
                <span className="text-4xl font-bold ml-1">Carbon Insight</span>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              {isLoggedIn ? (
                  <>
                    <Link
                        href="/get-started"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      Get Started
                    </Link>
                    <Link
                        href="/self-assessment"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      Self Assessment
                    </Link>
                    <Link
                        href="/manufacturing-data"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      Manufacturing Data
                    </Link>
                    <Link
                        href="/supply-chain-data"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      Supply Chain
                    </Link>
                    <Link
                        href="/results"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      Results
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-md text-sm font-medium text-red hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </button>
                  </>
              ) : (
                  <>

                      <Link
                        href="/register"
                        className="py-2 rounded-md text-sm font-bold"
                      >
                        <Button size="md">Register</Button>
                      </Link>

                    <Link
                        href="/login"
                        className="py-2 rounded-md text-sm font-bold"
                    >
                      <Button size="md">Login</Button>
                    </Link>
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}