"use client";

import { AuthProvider } from "@/context/auth-context";

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 