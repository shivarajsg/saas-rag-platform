"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientsUploader from "@/components/meal-plan/ingredients-uploader";
import DietaryPreferences from "@/components/meal-plan/dietary-preferences";
import ProteinTarget from "@/components/meal-plan/protein-target";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { useUserId } from "@/hooks/use-user-id";

interface MealPlanData {
  ingredients: string[];
  dietaryPreferences: string[];
  allergies: string[];
  proteinTarget: number;
}

const STEPS = [
  { title: "Upload Ingredients", description: "Upload an image of your ingredients or add them manually" },
  { title: "Dietary and Allergy Information", description: "Select your dietary preferences and allergies" },
  { title: "Set Your Protein Goal", description: "Set your daily protein target" },
  { title: "Review & Generate", description: "" },
];

export default function CreateMealPlanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [manualIngredients, setManualIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [proteinTarget, setProteinTarget] = useState(100);
  const [validationError, setValidationError] = useState("");
  const router = useRouter();
  const { userId } = useUserId();

  // Get all ingredients (both detected and manually added)
  const allIngredients = [...new Set([...ingredients, ...manualIngredients])];

  // Memoized callback to prevent infinite loop
  const handleDietaryPreferencesChange = useCallback((prefs: string[], allergiesList: string[]) => {
    setDietaryPreferences(prefs);
    setAllergies(allergiesList);
  }, []);

  // Navigate to a specific step when clicking on the step number/title
  const goToStep = (stepIndex: number) => {
    // Validate current step before allowing navigation
    if (stepIndex > 0 && allIngredients.length === 0) {
      const errorMsg = "Please add at least one ingredient before proceeding";
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setValidationError("");
    setCurrentStep(stepIndex);
  };

  // When the user clicks "Next"
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      // Validate current step
      if (currentStep === 0 && allIngredients.length === 0) {
        const errorMsg = "Please add at least one ingredient before proceeding";
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      setValidationError("");
      setCurrentStep(currentStep + 1);
    }
  };

  // When the user clicks "Back"
  const handleBack = () => {
    if (currentStep > 0) {
      setValidationError("");
      setCurrentStep(currentStep - 1);
    }
  };

  // When the user clicks "Generate Meal Plan"
  const handleGenerateMealPlan = () => {
    // Validate ingredients before generating the meal plan
    if (allIngredients.length === 0) {
      const errorMsg = "Please add at least one ingredient before generating a meal plan";
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Save the data to localStorage for persistence
    const mealPlanData: MealPlanData = {
      ingredients: allIngredients,
      dietaryPreferences,
      allergies,
      proteinTarget,
    };
    
    localStorage.setItem("mealPlanData", JSON.stringify(mealPlanData));
    
    // Redirect to the chat page with query parameters
    const params = new URLSearchParams();
    params.set("ingredients", allIngredients.join(","));
    if (dietaryPreferences.length > 0) {
      params.set("dietaryRestrictions", dietaryPreferences.join(","));
    }
    if (allergies.length > 0) {
      params.set("allergies", allergies.join(","));
    }
    params.set("proteinTarget", proteinTarget.toString());
    if (userId) {
      params.set("userId", userId);
    }
    
    router.push(`/meal-plan/chat?${params.toString()}`);
  };

  // Conditional rendering based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <IngredientsUploader
              existingIngredients={ingredients}
              onIngredientsChange={setIngredients}
              manualIngredients={manualIngredients}
              onManualIngredientsChange={setManualIngredients}
            />
            {validationError && (
              <p className="text-red-500 mt-2">{validationError}</p>
            )}
          </>
        );
      case 1:
        return (
          <DietaryPreferences
            existingData={{
              preferences: dietaryPreferences,
              allergies: allergies,
            }}
            onPreferencesChange={handleDietaryPreferencesChange}
          />
        );
      case 2:
        return (
          <ProteinTarget
            initialTarget={proteinTarget}
            onTargetChange={setProteinTarget}
          />
        );
      case 3:
        return (
          <div className="text-white">
            <p className="mb-6 text-white">
              Based on your ingredients, preferences, and protein goal, we'll create a
              personalized meal plan for you.
            </p>
            <div className="space-y-4 text-white">
              <div>
                <h4 className="font-medium mb-2 text-white">Ingredients:</h4>
                {allIngredients.length > 0 ? (
                  <p className="text-white">{allIngredients.join(", ")}</p>
                ) : (
                  <p className="text-red-500">No ingredients added. Please go back and add ingredients.</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2 text-white">Dietary Preferences:</h4>
                {dietaryPreferences.length > 0 ? (
                  <p className="text-white">{dietaryPreferences.join(", ")}</p>
                ) : (
                  <p className="text-gray-500">No dietary preferences selected</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2 text-white">Allergies:</h4>
                {allergies.length > 0 ? (
                  <p className="text-white">{allergies.join(", ")}</p>
                ) : (
                  <p className="text-gray-500">No allergies selected</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2 text-white">Daily Protein Target:</h4>
                <p className="text-white">{proteinTarget}g</p>
              </div>
            </div>
            {validationError && (
              <p className="text-red-500 mt-4">{validationError}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    // Calculate progress percentage
    const progressPercentage = (currentStep / (STEPS.length - 1)) * 100;
    
    return (
      <div className="w-full max-w-3xl mx-auto mb-8">
        {/* Step Circles */}
        <div className="flex justify-between items-center w-full mb-6">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center cursor-pointer ${index <= currentStep ? 'text-white' : 'text-gray-400'}`}
              onClick={() => goToStep(index)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                index < currentStep ? 'bg-gradient-to-r from-blue-600 to-emerald-600' : 
                index === currentStep ? 'bg-gradient-to-r from-blue-600 to-emerald-600 border-2 border-white' : 
                'bg-gray-700'
              }`}>
                {index < currentStep ? <Check size={18} /> : (index + 1)}
              </div>
              <div className="text-sm text-center">{step.title}</div>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 w-full">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 p-1 flex items-center justify-center text-white mr-2">
                <ArrowLeft size={24} />
              </div>
              <span className="text-3xl font-bold">Create Meal Plan</span>
            </Link>
          </div>
        </div>

        {renderStepIndicator()}

        <Card className="w-full max-w-3xl border-gray-700 bg-gray-800/80 shadow-lg mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-white">
              {STEPS[currentStep].title}
            </CardTitle>
            <p className="text-gray-300">{STEPS[currentStep].description}</p>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            {renderStepContent()}
            <div className="flex justify-between mt-8">
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
              >
                Back
              </Button>
              {currentStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleGenerateMealPlan}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                >
                  Generate Meal Plan
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}