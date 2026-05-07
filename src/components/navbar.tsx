"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import { UserIcon, LogOut, LogIn } from 'lucide-react';

export function Navbar() {
  const { user, isLoggedIn, logout } = useUser();
  const pathname = usePathname();

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="border-b px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Meal Planner
          </Link>
          
          <div className="ml-6 hidden space-x-4 md:flex">
            <Link 
              href="/" 
              className={`text-sm ${pathname === '/' ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </Link>
            <Link 
              href="/meal-plan/create" 
              className={`text-sm ${pathname === '/meal-plan/create' ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Create Plan
            </Link>
            <Link 
              href="/meal-plan/saved" 
              className={`text-sm ${pathname === '/meal-plan/saved' ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Saved Plans
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="mr-1 h-4 w-4" />
                <span>{user?.username}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="flex items-center"
            >
              <Link href="/login">
                <LogIn className="mr-1 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
} 