"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

// Define common dietary restrictions and allergies
const COMMON_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Diabetic', 'Gluten Free', 
  'Dairy Free', 'Keto', 'Low Carb', 'Low Fat'
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs',
  'Fish', 'Shellfish', 'Soy', 'Wheat'
];

type DietaryPreferencesProps = {
  existingData: {
    preferences: string[];
    allergies: string[];
  };
  onPreferencesChange: (preferences: string[], allergies: string[]) => void;
};

export default function DietaryPreferences({ 
  existingData, 
  onPreferencesChange 
}: DietaryPreferencesProps) {
  // Initialize with provided data
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    existingData?.preferences || []
  );
  
  const [allergies, setAllergies] = useState<string[]>(
    existingData?.allergies || []
  );
  
  // Custom input fields
  const [newRestriction, setNewRestriction] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  // Update when existing data changes
  useEffect(() => {
    if (existingData) {
      setDietaryRestrictions(existingData.preferences || []);
      setAllergies(existingData.allergies || []);
    }
  }, [existingData]);

  // Notify parent component whenever our state changes
  useEffect(() => {
    // Only notify if we have actually loaded data
    if (existingData) {
      onPreferencesChange(dietaryRestrictions, allergies);
    }
  }, [dietaryRestrictions, allergies, onPreferencesChange, existingData]);

  // Handle restriction checkbox toggle
  const handleToggleRestriction = (restriction: string) => {
    const newRestrictions = dietaryRestrictions.includes(restriction)
      ? dietaryRestrictions.filter(r => r !== restriction)
      : [...dietaryRestrictions, restriction];
    
    setDietaryRestrictions(newRestrictions);
  };

  // Handle allergy checkbox toggle
  const handleToggleAllergy = (allergy: string) => {
    const newAllergies = allergies.includes(allergy)
      ? allergies.filter(a => a !== allergy)
      : [...allergies, allergy];
    
    setAllergies(newAllergies);
  };

  // Add custom restriction
  const handleAddRestriction = () => {
    if (!newRestriction.trim()) return;
    
    // Skip if it's already in the list (case insensitive)
    const trimmed = newRestriction.trim();
    if (dietaryRestrictions.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      setNewRestriction("");
      return;
    }
    
    const newRestrictions = [...dietaryRestrictions, trimmed];
    setDietaryRestrictions(newRestrictions);
    setNewRestriction("");
  };

  // Add custom allergy
  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    
    // Skip if it's already in the list (case insensitive)
    const trimmed = newAllergy.trim();
    if (allergies.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      setNewAllergy("");
      return;
    }
    
    const newAllergies = [...allergies, trimmed];
    setAllergies(newAllergies);
    setNewAllergy("");
  };

  // Remove a custom restriction
  const handleRemoveRestriction = (restriction: string) => {
    const newRestrictions = dietaryRestrictions.filter(r => r !== restriction);
    setDietaryRestrictions(newRestrictions);
  };

  // Remove a custom allergy
  const handleRemoveAllergy = (allergy: string) => {
    const newAllergies = allergies.filter(a => a !== allergy);
    setAllergies(newAllergies);
  };

  // Get custom restrictions (ones not in the common list)
  const getCustomRestrictions = () => {
    return dietaryRestrictions.filter(r => !COMMON_RESTRICTIONS.includes(r));
  };

  // Get custom allergies (ones not in the common list)
  const getCustomAllergies = () => {
    return allergies.filter(a => !COMMON_ALLERGIES.includes(a));
  };

  return (
    <div className="space-y-8 text-white">
      {/* Dietary Restrictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dietary Restrictions</h3>
        
        {/* Common Restrictions Checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {COMMON_RESTRICTIONS.map(restriction => (
            <div key={restriction} className="flex items-center space-x-2">
              <Checkbox 
                id={`restriction-${restriction}`}
                checked={dietaryRestrictions.includes(restriction)}
                onCheckedChange={() => handleToggleRestriction(restriction)}
              />
              <Label 
                htmlFor={`restriction-${restriction}`} 
                className="text-sm cursor-pointer text-white"
              >
                {restriction}
              </Label>
            </div>
          ))}
        </div>
        
        {/* Add Custom Restrictions */}
        <div className="space-y-3 pt-2">
          <div className="flex gap-2">
            <Input 
              placeholder="Add other dietary restriction"
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRestriction();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleAddRestriction}
              type="button"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          {/* Display Custom Restrictions as Tags */}
          {getCustomRestrictions().length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {getCustomRestrictions().map(restriction => (
                <div 
                  key={restriction} 
                  className="bg-gray-600 text-white text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1"
                >
                  {restriction}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveRestriction(restriction)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Allergies */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-medium">Allergies</h3>
        
        {/* Common Allergies Checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {COMMON_ALLERGIES.map(allergy => (
            <div key={allergy} className="flex items-center space-x-2">
              <Checkbox 
                id={`allergy-${allergy}`}
                checked={allergies.includes(allergy)}
                onCheckedChange={() => handleToggleAllergy(allergy)}
              />
              <Label 
                htmlFor={`allergy-${allergy}`}
                className="text-sm cursor-pointer text-white"
              >
                {allergy}
              </Label>
            </div>
          ))}
        </div>
        
        {/* Add Custom Allergies */}
        <div className="space-y-3 pt-2">
          <div className="flex gap-2">
            <Input 
              placeholder="Add other allergy"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAllergy();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleAddAllergy}
              type="button"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          {/* Display Custom Allergies as Tags */}
          {getCustomAllergies().length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {getCustomAllergies().map(allergy => (
                <div 
                  key={allergy} 
                  className="bg-gray-600 text-white text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1"
                >
                  {allergy}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveAllergy(allergy)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}