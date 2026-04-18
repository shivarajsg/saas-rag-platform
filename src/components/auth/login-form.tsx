"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signIn(data.email, data.password);
      toast.success("Logged in successfully");
      
      // Add explicit router navigation here to ensure redirection works
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500); // Small delay to ensure the toast is visible
    } catch (error) {
      console.error("Login error:", error);
      
      // Provide user-friendly error messages based on the error type
      if (error instanceof Error) {
        const errorMsg = error.message;
        
        if (errorMsg.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please try again.");
          toast.error("Invalid email or password. Please try again.");
        } else if (errorMsg.includes("rate limit")) {
          setErrorMessage("Too many login attempts. Please try again later.");
          toast.error("Too many login attempts. Please try again later.");
        } else {
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-300 hover:text-blue-200">
              Forgot your password?
            </Link>
          </div>
          
          <Button className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded-md text-sm text-red-800">
              {errorMessage}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
} 