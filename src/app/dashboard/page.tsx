import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LogoutButton from "@/components/auth/logout-button";
import { Utensils } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="flex justify-between items-center mb-12 border-b border-gray-700 pb-4 w-full">
          <div className="flex items-center">
            <div className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 p-1 flex items-center justify-center text-white mr-2">
              <Utensils size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">AI Chef Mate</h1>
          </div>
          <LogoutButton className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-4 py-2 text-base" />
        </div>
        
        <div className="grid gap-8 grid-cols-3 py-8 place-items-center w-full max-w-8xl mx-auto">
          <Card className="flex flex-col border-gray-700 bg-gray-800/80 shadow-lg w-full h-full max-h-[500px] mx-auto ">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                <div className="text-white">
                  Create Meal Plan
                </div>
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Generate a personalized meal plan
                based on your ingredients
                and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-6">
              <p className="text-gray-300 text-lg">
                Upload ingredient photos or list them manually,
                add your preferences, and get a custom meal plan.
              </p>
            </CardContent>
            <CardFooter className="w-full pt-4">
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 py-6 text-lg text-white">
                <Link href="/meal-plan/create">Create A New Meal Plan</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col border-gray-700 bg-gray-800/80 shadow-lg w-full h-full max-h-[500px] mx-auto ">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                <div className="text-white">
                  My Meal Plans
                </div>
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                View and manage
                your saved
                meal plans
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-6">
              <p className="text-gray-300 text-lg">
                Access your previously saved meal plans,
                modify them, or create new ones.
              </p>
            </CardContent>
            <CardFooter className="w-full pt-4">
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 py-6 text-lg text-white">
                <Link href="/meal-plan/saved">View Saved Meal Plans</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col border-gray-700 bg-gray-800/80 shadow-lg w-full h-full max-h-[500px] mx-auto ">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                <div className="text-white">
                  Track Nutrition
                </div>
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Monitor your
                daily nutrition
                intake
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-6">
              <p className="text-gray-300 text-lg">
                Upload food photos to identify calories and macros,
                and keep track of your daily nutritional intake.
              </p>
            </CardContent>
            <CardFooter className="w-full pt-4">
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 py-6 text-lg text-white">
                <Link href="/nutrition/tracker">Track Nutrition</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}