"use client";

import { createContext, useContext, useState } from "react";
import { MealPlanService } from "@/services/meal-plan-service";
import { MealPlan } from "@/types/meal-plan";
import { useUserId } from "@/hooks/use-user-id";
import { toast } from "sonner";

type MealPlanContextType = {
  mealPlans: MealPlan[];
  loading: boolean;
  refreshMealPlans: () => Promise<void>;
  saveMealPlan: (content: string, name?: string) => Promise<MealPlan>;
  updateMealPlanName: (planId: string, newName: string) => Promise<void>;
  deleteMealPlan: (planId: string) => Promise<void>;
  mealPlanCount: number;
};

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [mealPlanCount, setMealPlanCount] = useState(0);
  const { userId } = useUserId();

  const refreshMealPlans = async () => {
    if (!userId) {
      toast.error("User ID not available. Please log in.");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching meal plans for user:", userId);
      const plans = await MealPlanService.getMealPlans(userId);
      setMealPlans(plans);
      setMealPlanCount(plans.length);
      console.log(`Loaded ${plans.length} meal plans`);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      toast.error("Failed to load your meal plans");
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async (content: string, name?: string): Promise<MealPlan> => {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    try {
      const savedPlan = await MealPlanService.saveMealPlan(userId, content, name);
      await refreshMealPlans();
      return savedPlan;
    } catch (error) {
      console.error("Error saving meal plan:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save meal plan: ${errorMessage}`);
      throw error;
    }
  };

  const updateMealPlanName = async (planId: string, newName: string): Promise<void> => {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    try {
      console.log(`Context: Updating meal plan ID ${planId} to name "${newName}" for user ${userId}`);
      
      // Update with user ID for security
      await MealPlanService.updateMealPlanName(planId, newName, userId);
      
      // Update local state for immediate UI update
      setMealPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId ? { ...plan, mp_name: newName } : plan
        )
      );
      
      // Refresh to ensure data consistency
      await refreshMealPlans();
    } catch (error) {
      console.error("Error updating meal plan name:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update meal plan name: ${errorMessage}`);
      throw error;
    }
  };

  const deleteMealPlan = async (planId: string): Promise<void> => {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    try {
      await MealPlanService.deleteMealPlan(planId, userId);
      
      // Also update the local state to immediately reflect the deletion
      setMealPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      setMealPlanCount(prevCount => Math.max(0, prevCount - 1));
      
      // Still refresh to ensure data consistency
      await refreshMealPlans();
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete meal plan: ${errorMessage}`);
      throw error;
    }
  };

  return (
    <MealPlanContext.Provider
      value={{
        mealPlans,
        loading,
        refreshMealPlans,
        saveMealPlan,
        updateMealPlanName,
        deleteMealPlan,
        mealPlanCount,
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error("useMealPlan must be used within a MealPlanProvider");
  }
  return context;
} 