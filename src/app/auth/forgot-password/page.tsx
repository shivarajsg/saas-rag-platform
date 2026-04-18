"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/auth-context";

const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResetPasswordFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { resetPassword } = useAuth();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);

    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Password reset error:", error);
      const message = error instanceof Error ? error.message : "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-900 to-slate-800">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-30rem)] top-0 h-[45rem] w-[80rem] -translate-x-1/2 rotate-[25deg] bg-gradient-to-tr from-emerald-900/40 to-teal-800/40 opacity-30 blur-3xl sm:left-[calc(50%-40rem)]"></div>
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
        
        <div className="w-full border border-gray-700 shadow-xl bg-gray-800/80 backdrop-blur-sm text-white rounded-lg p-8">
          {!isSubmitted ? (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
                <p className="text-gray-200">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
                <p className="text-gray-200">
                  We've sent a password reset link to your email address.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 