"use client"

import * as React from "react"

type CheckboxProps = {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({
  id,
  checked = false,
  onCheckedChange,
  className,
  disabled,
  ...props
}: CheckboxProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={`h-4 w-4 rounded-sm border border-gray-300 text-primary focus:ring-primary ${className || ""}`}
      {...props}
    />
  );
} 