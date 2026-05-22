import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';

// API configuration - explicitly use IPv4 localhost instead of default ::1 (IPv6)
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

// Function to check if FastAPI server is available
async function isFastAPIAvailable(): Promise<boolean> {
  try {
    console.log(`Checking FastAPI availability at ${FASTAPI_URL}/health`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Increase timeout to 5 seconds
    
    try {
      const response = await fetch(`${FASTAPI_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log("FastAPI server is available");
        return true;
      }
      return false;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      console.log(`FastAPI server not available: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      return false;
    }
  } catch (error) {
    console.log("Error checking FastAPI availability:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File is not an image" },
        { status: 400 }
      );
    }

    // Check if FastAPI server is available
    const fastAPIAvailable = await isFastAPIAvailable();

    if (fastAPIAvailable) {
      try {
        // Create a new FormData object to send to the FastAPI server
        const apiFormData = new FormData();
        apiFormData.append("file", file);
        
        // Call the FastAPI endpoint
        console.log(`Calling FastAPI service at ${FASTAPI_URL}/identify-ingredients`);
        const response = await fetch(`${FASTAPI_URL}/identify-ingredients`, {
          method: 'POST',
          body: apiFormData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("FastAPI error:", errorData);
          throw new Error(`FastAPI server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return NextResponse.json(data);
      } catch (error) {
        console.error("Error calling FastAPI:", error);
        // Fall back to mock implementation
        const mockIngredients = await mockIdentifyIngredients();
        return NextResponse.json({
          success: true,
          ingredients: mockIngredients,
          source: "mock (fallback)"
        });
      }
    } else {
      // Use mock implementation when FastAPI is not available
      console.log("FastAPI server not available, using mock implementation");
      const mockIngredients = await mockIdentifyIngredients();
      
      return NextResponse.json({
        success: true,
        ingredients: mockIngredients,
        source: "mock"
      });
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Mock implementation for when FastAPI server is not available
async function mockIdentifyIngredients(): Promise<string[]> {
  // Return mock ingredients based on random selection
  const possibleIngredients = [
    "tomato", "onion", "garlic", "potato", "carrot", "broccoli", 
    "chicken", "beef", "pork", "salmon", "tuna", "shrimp",
    "rice", "pasta", "bread", "flour", "sugar", "salt",
    "olive oil", "butter", "milk", "cheese", "eggs", "yogurt",
    "apple", "banana", "orange", "lemon", "strawberry", "blueberry"
  ];
  
  // Randomly select 3-8 ingredients
  const count = Math.floor(Math.random() * 6) + 3;
  const ingredients: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * possibleIngredients.length);
    const ingredient = possibleIngredients[randomIndex];
    
    if (!ingredients.includes(ingredient)) {
      ingredients.push(ingredient);
    }
  }
  
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return ingredients;
} 