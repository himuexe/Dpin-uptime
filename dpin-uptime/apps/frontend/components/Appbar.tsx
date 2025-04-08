"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,    
  UserButton,
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Activity, } from 'lucide-react';


export function Appbar() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
          <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xl font-bold">UptimeGuard</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Features</a>
          <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Pricing</a>
          <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Testimonials</a>
        </div>
        
        <div className="flex items-center space-x-4">          
          <SignedOut>
            <button 
              className="hidden md:block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <SignInButton />
            </button>
            
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <SignUpButton />
            </button>
          </SignedOut>
          
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}