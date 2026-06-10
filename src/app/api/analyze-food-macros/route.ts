import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Clone the request to forward to the Python API
    const formData = await req.formData();
    
    // Forward the request to the Python API
    const apiUrl = process.env.API_URL || "http://localhost:8000";
    
    try {
      const response = await fetch(`${apiUrl}/analyze-food-macros`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API returned status code ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Error connecting to FastAPI backend:", fetchError);
      
      // Return a default response with empty macros when FastAPI is unavailable
      return NextResponse.json({
        success: true,
        macros: {
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0
        }
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process food image" },
      { status: 500 }
    );
  }
} 