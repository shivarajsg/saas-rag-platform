"use client"

import * as React from "react"

type SliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number[];
  defaultValue?: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
};

export function Slider({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  className = "",
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onValueChange([newValue]);
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
} 