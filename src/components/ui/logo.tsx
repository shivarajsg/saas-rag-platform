import Link from "next/link";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light" | "dark";
  size?: "default" | "small" | "large";
  href?: string;
}

export function Logo({ 
  className, 
  variant = "default", 
  size = "default",
  href = "/"
}: LogoProps) {
  const colorClasses = {
    default: "text-white",
    light: "text-white",
    dark: "text-white",
  };

  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-3xl",
  };

  const gradientClasses = {
    default: "from-blue-600 to-emerald-600",
    light: "from-blue-300 to-emerald-300",
    dark: "from-blue-800 to-emerald-800",
  };

  const iconSizes = {
    small: 18,
    default: 24,
    large: 32,
  };

  // Only use Link if href is a non-empty string
  const Component = href && href.length > 0 ? Link : "div";

  return (
    <Component
      href={href}
      className={cn(
        "font-bold flex flex-col items-center",
        colorClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-center mb-4">
        <span className="mb-1">AI Chef Mate</span>
      </div>
      <div className={cn(
        "rounded-lg bg-gradient-to-r p-1 flex items-center justify-center text-white",
        gradientClasses[variant]
      )}>
        <Utensils size={iconSizes[size]} />
      </div>
    </Component>
  );
} 