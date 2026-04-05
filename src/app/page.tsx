import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Salad, Utensils, ChefHat, BarChart3 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-slate-800">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-white text-2xl">
            <div className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 p-1 flex items-center justify-center text-white">
              <Utensils size={24} />
            </div>
            <span>AI Chef Mate</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
            <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
              <Link href="/auth/register">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden py-20 sm:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[calc(50%-30rem)] top-0 h-[45rem] w-[80rem] -translate-x-1/2 rotate-[25deg] bg-gradient-to-tr from-emerald-900/40 to-teal-800/40 opacity-30 blur-3xl sm:left-[calc(50%-40rem)]"></div>
          <div className="absolute right-[calc(50%-30rem)] top-10 h-[40rem] w-[80rem] translate-x-1/2 rotate-[15deg] bg-gradient-to-br from-blue-900/40 to-indigo-800/40 opacity-30 blur-3xl sm:right-[calc(50%-40rem)]"></div>
        </div>

        <div className="container relative mx-auto px-6 lg:px-8">
          {/* Food Images - Left Side (Meats) */}
          <div className="absolute left-24 md:left-32 lg:left-48 top-1/2 -translate-y-1/2 hidden md:block z-10">
            <div className="mb-6">
              <img 
                src="/beef.png" 
                alt="Raw beef" 
                className="w-36 lg:w-44 h-auto object-contain" 
              />
            </div>
            <div>
              <img 
                src="/chicken.png" 
                alt="Raw chicken" 
                className="w-36 lg:w-44 h-auto object-contain"
              />
            </div>
          </div>
          
          {/* Food Images - Right Side (Vegetables and Fruits) */}
          <div className="absolute right-24 md:right-32 lg:right-48 top-1/2 -translate-y-[60%] hidden md:block z-10">
            <div className="mb-6">
              <img 
                src="/vegetables.png" 
                alt="Fresh vegetables" 
                className="w-40 lg:w-48 h-auto object-contain"
              />
            </div>
            <div>
              <img 
                src="/fruits.png" 
                alt="Fresh fruits" 
                className="w-40 lg:w-48 h-auto object-contain"
              />
            </div>
          </div>
          
          {/* Hero Text Content */}
          <div className="mx-auto max-w-3xl md:max-w-lg lg:max-w-2xl text-center px-4 relative z-0">
            <h1 className="mb-8 text-5xl font-bold tracking-tight text-gray-100 sm:text-6xl">
              <span className="block">Create a Meal Plan</span>
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Tailored For You
              </span>
            </h1>
            <p className="mb-10 text-xl leading-8 text-gray-300">
              Plan delicious, nutritious meals based on your ingredients, preferences,
              and dietary needs with our intelligent AI Agent.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/auth/register" className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-800 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute right-[calc(50%-10rem)] bottom-0 h-[20rem] w-[60rem] translate-x-1/2 bg-gradient-to-tr from-emerald-900/40 to-teal-800/40 opacity-20 blur-3xl sm:right-[calc(50%-30rem)]"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">Key Features</h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-gray-300">
            Discover how our meal planner can transform your cooking and eating experience
          </p>
          
          <div className="grid gap-10 md:grid-cols-3">
            <div className="group relative bg-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-600 overflow-hidden">
              <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-100">Ingredient Recognition</h3>
              <p className="text-gray-300">Upload photos of your ingredients and our AI will identify them to help create delicious meal plans using what you already have.</p>
            </div>
            
            <div className="group relative bg-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-600 overflow-hidden">
              <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <ChefHat className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-100">Personalized Meal Plans</h3>
              <p className="text-gray-300">Get custom meal plans based on your dietary preferences, allergies, and nutritional goals tailored to your specific needs.</p>
            </div>
            
            <div className="group relative bg-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-600 overflow-hidden">
              <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-100">Nutrition Tracking</h3>
              <p className="text-gray-300">Track your daily calorie and macro intake by simply taking pictures of your meals for effortless nutritional monitoring.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-700 to-slate-800">
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">How It Works</h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-gray-300">
            Three simple steps to get personalized meal plans
          </p>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">1</div>
                <h3 className="mb-3 text-xl font-semibold text-gray-100">Add Your Ingredients</h3>
                <p className="text-gray-300">Take a photo of your ingredients or add them manually to get started.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white text-2xl font-bold">2</div>
                <h3 className="mb-3 text-xl font-semibold text-gray-100">Set Your Preferences</h3>
                <p className="text-gray-300">Tell us about your dietary restrictions, allergies, and protein goals.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white text-2xl font-bold">3</div>
                <h3 className="mb-3 text-xl font-semibold text-gray-100">Get Your Meal Plan</h3>
                <p className="text-gray-300">Receive a customized weekly meal plan optimized for your needs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-800 to-emerald-800 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to transform your meal planning?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Join now and discover the easiest way to plan delicious, nutritious meals that match your lifestyle.
          </p>
          <Button asChild variant="default" size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-8">
            <Link href="/auth/register" className="flex items-center">
              Get Started 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
