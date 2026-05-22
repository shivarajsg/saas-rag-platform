"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, Plus, Check, Image, Search } from 'lucide-react';
import { toast } from 'sonner';

type IngredientsUploaderProps = {
  existingIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  manualIngredients: string[];
  onManualIngredientsChange: (ingredients: string[]) => void;
};

export default function IngredientsUploader({ 
  existingIngredients,
  onIngredientsChange,
  manualIngredients,
  onManualIngredientsChange
}: IngredientsUploaderProps) {
  const [manualIngredient, setManualIngredient] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image`);
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadPreview(previewUrl);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Don't automatically analyze the image anymore - user will click the analyze button
  };

  // Remove the uploaded image
  const removeUpload = () => {
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }
    setUploadedFile(null);
    setUploadPreview(null);
  };

  // Analyze image with AI
  const analyzeImage = async (file: File | null) => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/identify-ingredients', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const data = await response.json();
      
      if (data.success && data.ingredients && data.ingredients.length > 0) {
        // Combine with existing ingredients without duplicates
        const newIngredients = [...new Set([...existingIngredients, ...data.ingredients])];
        onIngredientsChange(newIngredients);
        toast.success('Image analyzed successfully');
      } else {
        toast.error('No ingredients detected in the image');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add manual ingredient
  const addManualIngredient = () => {
    if (!manualIngredient.trim()) return;
    
    // Check for duplicates across both lists
    const trimmedIngredient = manualIngredient.trim();
    if (
      manualIngredients.includes(trimmedIngredient) || 
      existingIngredients.includes(trimmedIngredient)
    ) {
      toast.error('This ingredient is already in your list');
      return;
    }
    
    const newManualIngredients = [...manualIngredients, trimmedIngredient];
    onManualIngredientsChange(newManualIngredients);
    setManualIngredient('');
  };

  // Remove ingredient (can be either AI-detected or manually added)
  const removeIngredient = (ingredient: string) => {
    // Check if it's a manually added ingredient
    if (manualIngredients.includes(ingredient)) {
      const newManualIngredients = manualIngredients.filter(item => item !== ingredient);
      onManualIngredientsChange(newManualIngredients);
    } else {
      // It's an AI-detected ingredient
      const newIngredients = existingIngredients.filter(item => item !== ingredient);
      onIngredientsChange(newIngredients);
    }
  };

  // Combine all ingredients for display
  const allIngredients = [...existingIngredients, ...manualIngredients];

  return (
    <div className="space-y-6 text-white">
      {/* Image Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Upload Photo of Ingredients</h3>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleUploadClick} 
            className="flex-1 py-8 border-dashed border-gray-600 bg-gray-700 hover:bg-gray-600 text-white"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploadPreview ? 'Change Image' : 'Upload Image'}
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          
          {uploadPreview && (
            <div className="relative h-28 w-28 rounded-md overflow-hidden">
              <img 
                src={uploadPreview} 
                alt="Ingredients" 
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={removeUpload}
                disabled={isAnalyzing}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {uploadedFile && (
          <div className="flex justify-center">
            <Button 
              onClick={() => analyzeImage(uploadedFile)} 
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="flex items-center justify-center text-white">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Analyzing image...</span>
          </div>
        )}
      </div>
      
      {/* Manual Ingredients Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Add Ingredients Manually</h3>
        
        <div className="flex gap-2">
          <Input
            placeholder="Add ingredient (e.g., chicken, rice, tomatoes)"
            value={manualIngredient}
            onChange={(e) => setManualIngredient(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addManualIngredient();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={addManualIngredient}
            type="button"
            className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
      
      {/* Ingredients List */}
      {allIngredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Your Ingredients</h3>
            <span className="text-sm text-gray-400">{allIngredients.length} ingredients</span>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg min-h-[100px] border border-gray-600">
            <div className="flex flex-wrap gap-2">
              {allIngredients.map((ingredient, index) => (
                <div 
                  key={`${ingredient}-${index}`}
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-full text-sm
                    bg-gray-600 text-white
                  `}
                >
                  <span>{ingredient}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeIngredient(ingredient)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 