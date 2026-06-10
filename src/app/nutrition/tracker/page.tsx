"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, Upload, X, Plus, Search, Camera, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define types
interface Macros {
  calories: number;
  protein?: number;
  proteins: number; // For compatibility with API
  fats: number;
  carbs: number;
}

interface Meal {
  id?: string;
  username: string;
  meal_name: string;
  food_name: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  date_added: string;
}

interface WeeklySummary {
  daily_summary: Record<string, {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    meals: Meal[];
  }>;
  weekly_totals: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
  daily_averages: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}

export default function NutritionTrackerPage() {
  // State for user identification
  const [userId, setUserId] = useState<string>("");
  
  // State for meal tracking
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for adding a new meal
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealType, setMealType] = useState<string>("");
  const [foodName, setFoodName] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedMacros, setAnalyzedMacros] = useState<Macros | null>(null);
  const [editableMacros, setEditableMacros] = useState<Macros>({
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0
  });
  
  // Initialize user ID from localStorage
  useEffect(() => {
    try {
      // Get userId from localStorage or generate a new one
      let storedUserId = localStorage.getItem("mealplan_user_id");
      if (!storedUserId) {
        storedUserId = `user_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem("mealplan_user_id", storedUserId);
        console.log("Generated new user ID:", storedUserId);
      }
      setUserId(storedUserId);
      console.log("Using user ID:", storedUserId);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // Fallback with a temporary ID
      const tempId = `temp_${Math.random().toString(36).substring(2, 15)}`;
      setUserId(tempId);
      console.log("Using temporary user ID:", tempId);
    }
  }, []);
  
  // Load user's nutrition data
  useEffect(() => {
    if (userId) {
      loadNutritionData();
    } else {
      console.warn("No user ID available yet, will load data once ID is available");
    }
  }, [userId]);
  
  const loadNutritionData = async () => {
    setIsLoading(true);
    try {
      if (!userId) {
        console.warn("No user ID available, skipping data load");
        setIsLoading(false);
        return;
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`Loading nutrition data for user ${userId}, date ${today}`);
      
      // Fetch today's meals
      const todayResponse = await fetch(`/api/get-user-macros/${userId}?date=${today}`);
      const todayData = await todayResponse.json();
      
      if (todayData.success) {
        setTodayMeals(todayData.macros || []);
        console.log(`Loaded ${todayData.macros?.length || 0} meals for today`);
      } else {
        console.error("Error loading today's meals:", todayData.error);
        toast.error("Failed to load today's nutrition data");
        setTodayMeals([]);
      }
      
      // Fetch weekly summary - log the raw response 
      console.log(`Fetching weekly macros for user ${userId}`);
      const weeklyResponse = await fetch(`/api/get-user-weekly-macros/${userId}`);
      const rawData = await weeklyResponse.text();
      console.log("Raw weekly data response:", rawData);
      
      try {
        // Parse the raw response
        const weeklyData = JSON.parse(rawData);
        console.log("Parsed weekly data:", weeklyData);
        
        // Store the raw data directly without any processing
        if (weeklyData && weeklyData.success) {
          setWeeklySummary(weeklyData);
          console.log("Set weekly summary state with:", weeklyData);
        } else {
          console.error("Error in weekly data response:", weeklyData);
          toast.error("Failed to load weekly nutrition summary");
          setWeeklySummary(null);
        }
      } catch (parseError) {
        console.error("Error parsing weekly data:", parseError);
        toast.error("Failed to parse weekly nutrition data");
        setWeeklySummary(null);
      }
    } catch (error) {
      console.error("Error loading nutrition data:", error);
      toast.error("Failed to load nutrition data");
      setTodayMeals([]);
      setWeeklySummary(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate daily totals
  const dailyTotals = {
    calories: todayMeals.reduce((sum, meal) => sum + meal.calories, 0),
    proteins: todayMeals.reduce((sum, meal) => sum + meal.proteins, 0),
    carbs: todayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
    fats: todayMeals.reduce((sum, meal) => sum + meal.fats, 0)
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image`);
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadPreview(previewUrl);
    
    // Reset analyzed macros
    setAnalyzedMacros(null);
    setEditableMacros({
      calories: 0,
      proteins: 0,
      fats: 0,
      carbs: 0
    });
  };
  
  // Remove the uploaded image
  const removeUpload = () => {
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }
    setUploadedFile(null);
    setUploadPreview(null);
    setAnalyzedMacros(null);
  };
  
  // Analyze food image
  const analyzeImage = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an image first');
      return;
    }
    
    if (!foodName.trim()) {
      toast.error('Please enter a food name');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('food_name', foodName);
      
      const response = await fetch('/api/analyze-food-macros', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const data = await response.json();
      
      if (data.success && data.macros) {
        setAnalyzedMacros(data.macros);
        
        // Set editable macros with the analyzed values
        setEditableMacros({
          calories: data.macros.calories || 0,
          proteins: data.macros.protein || data.macros.proteins || 0,
          fats: data.macros.fats || 0,
          carbs: data.macros.carbs || 0
        });
        
        toast.success('Image analyzed successfully');
      } else {
        toast.error('No nutrition data detected');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle adding a meal to the tracker
  const handleAddToTracker = async () => {
    if (!mealType) {
      toast.error('Please select a meal type');
      return;
    }
    
    if (!foodName.trim()) {
      toast.error('Please enter a food name');
      return;
    }
    
    if (!userId) {
      console.error("No user ID available");
      toast.error('User ID not available. Please refresh the page.');
      return;
    }
    
    // Check if the user already has this meal type for today (except for snacks)
    if (mealType !== 'snack') {
      const today = new Date().toISOString().split('T')[0];
      const existingMeal = todayMeals.find(
        meal => meal.meal_name === mealType && meal.date_added === today
      );
      
      if (existingMeal) {
        toast.error(`You already have a ${mealType} recorded for today`);
        return;
      }
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const mealData = {
        username: userId,
        meal_name: mealType,
        food_name: foodName,
        calories: Math.round(editableMacros.calories),
        proteins: Math.round(editableMacros.proteins),
        fats: Math.round(editableMacros.fats),
        carbs: Math.round(editableMacros.carbs),
        date_added: today
      };
      
      console.log(`Saving meal for user ${userId}:`, mealData);
      
      toast.loading('Saving meal...');
      
      const response = await fetch('/api/save-macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      });
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError, 'Raw response:', responseText);
        throw new Error(`Failed to parse server response: ${responseText}`);
      }
      
      if (data.success) {
        toast.dismiss();
        toast.success('Meal added successfully');
        
        // Reset form
        setMealType("");
        setFoodName("");
        removeUpload();
        setAnalyzedMacros(null);
        setEditableMacros({
          calories: 0,
          proteins: 0,
          fats: 0,
          carbs: 0
        });
        setIsAddingMeal(false);
        
        // Reload data
        loadNutritionData();
      } else {
        toast.dismiss();
        toast.error(`Failed to add meal: ${data.error || 'Unknown error'}`);
        console.error('Error saving meal:', data);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error saving meal:', error);
      toast.error(`Failed to save meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Group meals by type
  const mealsByType: Record<string, Meal[]> = {};
  
  todayMeals.forEach(meal => {
    if (!mealsByType[meal.meal_name]) {
      mealsByType[meal.meal_name] = [];
    }
    mealsByType[meal.meal_name].push(meal);
  });
  
  // Order meal types
  const orderedMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 w-full">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 p-1 flex items-center justify-center text-white mr-2">
                <ArrowLeft size={24} />
              </div>
              <span className="text-3xl font-bold">Nutrition Tracker</span>
            </Link>
          </div>
          <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-[95%] max-h-[90vh] bg-gray-800 border-gray-700 text-white rounded-xl overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-white">Add a New Meal</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-100px)] pr-4 pb-6">
                <div className="space-y-4 py-4">
                  {/* Meal Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="meal-type" className="text-white">Meal Type</Label>
                    <Select value={mealType} onValueChange={setMealType}>
                      <SelectTrigger id="meal-type" className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select a meal type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Food Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="food-name" className="text-white">Food Name</Label>
                    <Input
                      id="food-name"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      placeholder="Enter food name (e.g., Chicken Salad)"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-white">Food Image</Label>
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => document.getElementById('food-image-upload')?.click()} 
                        className="flex-1 py-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                        disabled={isAnalyzing}
                        type="button"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="mr-2 h-4 w-4" />
                        )}
                        {uploadPreview ? 'Change Image' : 'Upload Food Image'}
                      </Button>
                      
                      <input
                        type="file"
                        id="food-image-upload"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                      
                      {uploadPreview && (
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <img 
                            src={uploadPreview} 
                            alt="Food" 
                            className="h-full w-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={removeUpload}
                            disabled={isAnalyzing}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {uploadedFile && !analyzedMacros && (
                      <div className="flex justify-center mt-2">
                        <Button 
                          onClick={analyzeImage} 
                          disabled={isAnalyzing}
                          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                          type="button"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Analyze Image
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Nutritional Information (shows up after analysis) */}
                  {analyzedMacros && (
                    <div className="space-y-4 border border-gray-600 rounded-md p-4">
                      <h3 className="font-medium text-white">Nutritional Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="calories" className="text-white">Calories (kcal)</Label>
                        <Input
                          id="calories"
                          type="number"
                          value={editableMacros.calories.toString()}
                          onChange={(e) => setEditableMacros({
                            ...editableMacros,
                            calories: Number(e.target.value) || 0
                          })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="protein" className="text-white">Protein (grams)</Label>
                        <Input
                          id="protein"
                          type="number"
                          value={editableMacros.proteins.toString()}
                          onChange={(e) => setEditableMacros({
                            ...editableMacros,
                            proteins: Number(e.target.value) || 0
                          })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="carbs" className="text-white">Carbs (grams)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          value={editableMacros.carbs.toString()}
                          onChange={(e) => setEditableMacros({
                            ...editableMacros,
                            carbs: Number(e.target.value) || 0
                          })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fat" className="text-white">Fat (grams)</Label>
                        <Input
                          id="fat"
                          type="number"
                          value={editableMacros.fats.toString()}
                          onChange={(e) => setEditableMacros({
                            ...editableMacros,
                            fats: Number(e.target.value) || 0
                          })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white" 
                        onClick={handleAddToTracker}
                      >
                        Add to Tracker
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {/* Weekly Nutrition Summary */}
              <Card className="md:col-span-2 border-gray-700 bg-gray-800/80 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Weekly Nutrition Summary</CardTitle>
                  <CardDescription className="text-gray-300">Your nutritional intake for the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Calories</p>
                      <p className="text-2xl font-bold text-white">
                        {weeklySummary?.weekly_totals?.calories || 0}
                      </p>
                      <p className="text-xs text-gray-400">kcal</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Protein</p>
                      <p className="text-2xl font-bold text-white">
                        {weeklySummary?.weekly_totals?.proteins || 0}
                      </p>
                      <p className="text-xs text-gray-400">grams</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Carbs</p>
                      <p className="text-2xl font-bold text-white">
                        {weeklySummary?.weekly_totals?.carbs || 0}
                      </p>
                      <p className="text-xs text-gray-400">grams</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Fat</p>
                      <p className="text-2xl font-bold text-white">
                        {weeklySummary?.weekly_totals?.fats || 0}
                      </p>
                      <p className="text-xs text-gray-400">grams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Daily Meals List */}
              <Card className="md:row-span-2 border-gray-700 bg-gray-800/80 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Today's Meals</CardTitle>
                    <CardDescription className="text-gray-300">Your food intake for today</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {todayMeals.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">
                      No meals added for today. Add a meal to get started.
                    </p>
                  ) : (
                    <ScrollArea className="h-auto max-h-[600px] pr-4 overflow-y-auto">
                      <div className="pb-6 space-y-4"> {/* Added space-y-4 for better spacing between meal types */}
                        {orderedMealTypes.map(mealType => {
                          const meals = mealsByType[mealType] || [];
                          if (meals.length === 0) return null;
                          
                          return (
                            <div key={mealType} className="mb-4">
                              <h3 className="text-lg font-semibold capitalize mb-3 text-white">{mealType}</h3>
                              <div className="space-y-3"> {/* Added container with spacing for meal items */}
                                {meals.map((meal, index) => (
                                  <div key={meal.id || index} className="border border-gray-700 bg-gray-700/50 rounded-lg p-3">
                                    <div className="flex justify-between items-baseline">
                                      <h4 className="font-medium text-white">{meal.food_name}</h4>
                                      <span className="text-sm text-gray-300">{meal.calories} kcal</span>
                                    </div>
                                    <div className="flex gap-3 mt-1 text-xs text-gray-300">
                                      <span>P: {meal.proteins}g</span>
                                      <span>C: {meal.carbs}g</span>
                                      <span>F: {meal.fats}g</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
              
              {/* Daily Nutrition Summary */}
              <Card className="md:col-span-2 border-gray-700 bg-gray-800/80 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Daily Nutrition Summary</CardTitle>
                  <CardDescription className="text-gray-300">Your nutritional intake for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Calories</p>
                      <p className="text-2xl font-bold text-white">{dailyTotals.calories}</p>
                      <p className="text-xs text-gray-400">kcal</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Protein</p>
                      <p className="text-2xl font-bold text-white">{dailyTotals.proteins}</p>
                      <p className="text-xs text-gray-400">grams</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Carbs</p>
                      <p className="text-2xl font-bold text-white">{dailyTotals.carbs}</p>
                      <p className="text-xs text-gray-400">grams</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-400">Fat</p>
                      <p className="text-2xl font-bold text-white">{dailyTotals.fats}</p>
                      <p className="text-xs text-gray-400">grams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}