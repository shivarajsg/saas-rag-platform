"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from "sonner";

type ProteinTargetProps = {
  onTargetChange: (grams: number) => void;
  initialTarget?: number;
};

export default function ProteinTarget({ onTargetChange, initialTarget = 100 }: ProteinTargetProps) {
  const [proteinTarget, setProteinTarget] = useState<number>(
    initialTarget < 0 ? 100 : initialTarget > 200 ? 200 : initialTarget
  );
  const [inputValue, setInputValue] = useState<string>(proteinTarget.toString());
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (initialTarget !== undefined) {
      const validTarget = Math.min(Math.max(initialTarget, 1), 200);
      setProteinTarget(validTarget);
      setInputValue(validTarget.toString());
    }
  }, [initialTarget]);

  const validateAndUpdate = (value: number) => {
    if (value <= 0) {
      setError("Protein target must be greater than 0g");
      return false;
    }
    
    if (value > 200) {
      setError("Protein target must be 200g or less");
      return false;
    }
    
    setError("");
    setProteinTarget(value);
    onTargetChange(value);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      validateAndUpdate(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue <= 0) {
      setInputValue(proteinTarget.toString());
      setError("");
    } else if (numValue > 200) {
      setInputValue("200");
      setProteinTarget(200);
      onTargetChange(200);
      toast.warning("Protein target has been limited to 200g");
      setError("");
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setInputValue(newValue.toString());
    
    if (validateAndUpdate(newValue)) {
      setProteinTarget(newValue);
      onTargetChange(newValue);
    }
  };

  return (
    <div className="space-y-4 text-white">
      <div className="space-y-2">
        <Label htmlFor="protein-target" className="text-white">Daily Protein Target (grams)</Label>
        <div className="flex items-center gap-4">
          <Input
            id="protein-target"
            type="number"
            min="1"
            max="200"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-20 ${error ? 'border-red-500' : ''}`}
          />
          <div className="flex-1">
            <Slider
              defaultValue={[proteinTarget]}
              min={1}
              max={200}
              step={5}
              value={[proteinTarget]}
              onValueChange={(value) => handleSliderChange(value)}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <p className="text-sm text-gray-500">
          Recommended daily protein intake varies based on activity level and body weight.
          For active individuals, 1.2 to 2.0 grams per kg of body weight is commonly recommended.
          (Range: 1-200g)
        </p>
      </div>
    </div>
  );
} 