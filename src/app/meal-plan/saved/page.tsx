"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, X, Save, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import KeyMarkdown from "@/components/utils/key-markdown";
import { useMealPlan } from "@/context/meal-plan-context";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  MealPlanDialog,
  MealPlanDialogContent,
  MealPlanDialogTitle,
} from "@/components/ui/meal-plan-dialog";

export default function SavedMealPlansPage() {
  const { mealPlans, loading, updateMealPlanName, deleteMealPlan, refreshMealPlans } = useMealPlan();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Load meal plans when the page is opened
  useEffect(() => {
    // Only load once when the component mounts
    if (!hasInitiallyLoaded) {
      console.log("Initial load of meal plans on SavedMealPlansPage mount");
      refreshMealPlans().then(() => {
        setHasInitiallyLoaded(true);
      });
    }
  }, [refreshMealPlans, hasInitiallyLoaded]);

  const handleEditName = (id: string | undefined, name: string) => {
    if (!id) return;
    console.log(`Starting edit for plan ID: ${id}, current name: "${name}"`);
    setEditingName(id);
    setNewName(name);
  };

  const handleSaveName = async (id: string | undefined) => {
    if (!id) {
      toast.error("Invalid meal plan ID");
      return;
    }

    if (!newName.trim()) {
      toast.error('Meal plan name cannot be empty');
      return;
    }
    
    console.log(`Attempting to update plan ID: ${id} to new name: "${newName}"`);
    
    setIsUpdating(true);
    try {
      toast.loading('Updating meal plan name...', { id: 'update-toast' });
      
      await updateMealPlanName(id, newName);
      
      setEditingName(null);
      toast.dismiss('update-toast');
      toast.success('Meal plan name updated successfully');
    } catch (error) {
      toast.dismiss('update-toast');
      console.error("Error in handleSaveName:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update meal plan name: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePlan = async (id: string | undefined) => {
    if (!id) {
      toast.error("Cannot delete: meal plan ID is missing");
      setDeletingPlan(null);
      return;
    }
    
    try {
      setIsDeleting(true);
      toast.loading('Deleting meal plan...', { id: 'delete-toast' });
      
      // Find the meal plan name for better user feedback
      const planToDelete = mealPlans.find(p => p.id === id);
      const planName = planToDelete?.mp_name || 'selected plan';
      
      await deleteMealPlan(id);
      
      toast.dismiss('delete-toast');
      toast.success(`"${planName}" deleted successfully`);
      setDeletingPlan(null);
    } catch (error) {
      toast.dismiss('delete-toast');
      console.error('Error deleting meal plan:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete meal plan: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (id: string | undefined) => {
    if (!id) return;
    setExpandedPlan(expandedPlan === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 w-full">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 p-1 flex items-center justify-center text-white mr-2">
                <ArrowLeft size={24} />
              </div>
              <span className="text-3xl font-bold">My Saved Meal Plans</span>
            </Link>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white">
            <Link href="/meal-plan/create">Create New Plan</Link>
          </Button>
        </div>
      
        {loading && !mealPlans.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : mealPlans.length === 0 ? (
          <div className="mb-8">
            <p className="text-gray-300">You don't have any saved meal plans yet. Create a new plan to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mealPlans.map((plan) => (
              <Card key={plan.id} className="relative border-gray-700 bg-gray-800/80 shadow-lg">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  {editingName === plan.id ? (
                    <div className="flex w-full space-x-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter meal plan name"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveName(plan.id)}
                        className="px-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                        disabled={isUpdating}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingName(null)}
                        className="px-2 bg-gray-900 border-gray-700 hover:bg-gray-800"
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg text-white">{plan.mp_name}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                          onClick={() => handleEditName(plan.id, plan.mp_name)}
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit name</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                          onClick={() => setDeletingPlan(plan.id || null)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete plan</span>
                        </Button>
                      </div>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-gray-400">
                    Created on {(() => {
                      try {
                        if (!plan.created_at) return 'Today';
                        
                        const date = new Date(plan.created_at);
                        if (isNaN(date.getTime())) return 'Today';
                        
                        return date.toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        });
                      } catch (e) {
                        return 'Today';
                      }
                    })()}
                  </CardDescription>
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => toggleExpand(plan.id)}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                    >
                      {expandedPlan === plan.id ? 'Collapse' : 'View Plan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingPlan} onOpenChange={(open) => !open && setDeletingPlan(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogTitle>Delete Meal Plan</DialogTitle>
          <p className="py-4">Are you sure you want to delete this meal plan? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeletingPlan(null)}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleDeletePlan(deletingPlan || undefined)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Expanded view with custom dialog */}
      {expandedPlan && (
        <MealPlanDialog open={!!expandedPlan} onOpenChange={(open) => !open && setExpandedPlan(null)}>
          <MealPlanDialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-gray-900 border-gray-700 text-white">
            {mealPlans.find(plan => plan.id === expandedPlan) && (
              <>
                <MealPlanDialogTitle>{mealPlans.find(plan => plan.id === expandedPlan)?.mp_name}</MealPlanDialogTitle>
                <div className="prose prose-invert max-w-none mt-4">
                  <KeyMarkdown content={mealPlans.find(plan => plan.id === expandedPlan)?.mp || ''} />
                </div>
              </>
            )}
          </MealPlanDialogContent>
        </MealPlanDialog>
      )}
    </div>
  );
} 