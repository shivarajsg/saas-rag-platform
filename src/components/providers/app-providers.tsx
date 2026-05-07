"use client";

import { AuthProvider } from "@/context/auth-context";
import { MealPlanProvider } from "@/context/meal-plan-context";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MealPlanProvider>
        {children}
        <Toaster />
      </MealPlanProvider>
    </AuthProvider>
  );
} 