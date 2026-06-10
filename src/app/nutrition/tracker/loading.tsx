import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NutritionTrackerLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
        <div className="w-24 h-10 rounded-md bg-gray-200 animate-pulse" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Weekly Nutrition Summary Loading */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Nutrition Summary</CardTitle>
            <CardDescription>Your nutritional intake for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {i === 1 ? "Calories" : i === 2 ? "Protein" : i === 3 ? "Carbs" : "Fat"}
                  </p>
                  <div className="h-8 w-16 bg-gray-200 animate-pulse mx-auto my-2 rounded" />
                  <p className="text-xs text-muted-foreground">
                    {i === 1 ? "kcal" : "grams"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Daily Meals List Loading */}
        <Card className="md:row-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Meals</CardTitle>
              <CardDescription>Your food intake for today</CardDescription>
            </div>
            <div className="w-28 h-9 bg-gray-200 animate-pulse rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
        
        {/* Daily Nutrition Summary Loading */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Nutrition Summary</CardTitle>
            <CardDescription>Your nutritional intake for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {i === 1 ? "Calories" : i === 2 ? "Protein" : i === 3 ? "Carbs" : "Fat"}
                  </p>
                  <div className="h-8 w-16 bg-gray-200 animate-pulse mx-auto my-2 rounded" />
                  <p className="text-xs text-muted-foreground">
                    {i === 1 ? "kcal" : "grams"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 