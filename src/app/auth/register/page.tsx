import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Utensils } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-900 to-slate-800">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-30rem)] top-0 h-[45rem] w-[80rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-900/40 to-teal-800/40 opacity-30 blur-3xl sm:left-[calc(50%-40rem)]"></div>
        <div className="absolute right-[calc(50%-30rem)] top-10 h-[40rem] w-[80rem] translate-x-1/2 rotate-[15deg] bg-gradient-to-br from-blue-900/40 to-indigo-800/40 opacity-30 blur-3xl sm:right-[calc(50%-40rem)]"></div>
      </div>
      
      {/* Back to home link */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 text-white hover:text-blue-200 transition-colors flex items-center gap-2 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to home</span>
      </Link>
      
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-white font-bold text-3xl mb-4 flex items-center">
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 p-1 flex items-center justify-center text-white mr-2">
            <Utensils size={28} />
          </div>
          <span>AI Chef Mate</span>
        </div>
        
        <Card className="w-full border-gray-700 shadow-xl bg-gray-800/80 backdrop-blur-sm text-white">
          <CardHeader className="space-y-4 text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white mt-2">Join AI Chef Mate</CardTitle>
            <CardDescription className="text-gray-200">
              Create an account to start your personalized cooking journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-6 text-center text-sm text-white">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-blue-300 hover:text-blue-200">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 