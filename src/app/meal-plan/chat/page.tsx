"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Dynamically import the ChatInterface to avoid hydration issues
const ChatInterface = dynamic(() => import("@/components/chat/chat-interface"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="ml-2 text-gray-600">Loading chat interface...</p>
    </div>
  ),
});

// Component to handle the search params loading
function MealPlanChatContent() {
  const searchParams = useSearchParams();
  const [planData, setPlanData] = useState<{
    ingredients: string[];
    dietaryRestrictions: string[];
    allergies: string[];
    proteinTarget?: number;
  } | null>(null);

  useEffect(() => {
    // Try to load data from URL params first
    const ingredientsParam = searchParams.get("ingredients");
    const dietaryRestrictionsParam = searchParams.get("dietaryRestrictions");
    const allergiesParam = searchParams.get("allergies");
    const proteinTargetParam = searchParams.get("proteinTarget");

    if (ingredientsParam) {
      // Data is in URL params
      setPlanData({
        ingredients: ingredientsParam.split(","),
        dietaryRestrictions: dietaryRestrictionsParam?.split(",") || [],
        allergies: allergiesParam?.split(",") || [],
        proteinTarget: proteinTargetParam ? parseInt(proteinTargetParam) : undefined,
      });
    } else {
      // Try to load from localStorage
      const storedData = localStorage.getItem("mealPlanData");
      if (storedData) {
        setPlanData(JSON.parse(storedData));
      }
    }
  }, [searchParams]);

  if (!planData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white">
        <div className="container mx-auto max-w-4xl py-10 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Meal Plan Data Found</h1>
            <p className="mb-6">
              It looks like you haven't created a meal plan yet, or the data was lost.
            </p>
            <Link href="/meal-plan/create">
              <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white">Create a Meal Plan</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 w-full">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 p-1 flex items-center justify-center text-white mr-2">
                <ArrowLeft size={24} />
              </div>
              <span className="text-3xl font-bold">Create Your Meal Plan</span>
            </Link>
          </div>
        </div>

        <div className="w-full mx-auto">
          <ChatInterface 
            initialMessage="Generate a meal plan for me"
            ingredients={planData.ingredients}
            dietaryRestrictions={planData.dietaryRestrictions}
            allergies={planData.allergies}
            proteinTarget={planData.proteinTarget}
          />
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function MealPlanChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <span className="ml-3 text-xl">Loading meal plan data...</span>
      </div>
    }>
      <MealPlanChatContent />
    </Suspense>
  );
} 