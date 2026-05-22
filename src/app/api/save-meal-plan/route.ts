import { NextRequest, NextResponse } from "next/server";
import { saveMealPlan } from "@/lib/meal-plan";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Request received with body:", {
      userId: body.userId ? 'present' : 'missing',
      mealPlanContentLength: body.mealPlanContent ? body.mealPlanContent.length : 0,
      planName: body.planName || 'not provided'
    });
    
    const { userId, mealPlanContent, planName } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!mealPlanContent) {
      return NextResponse.json(
        { success: false, error: "Meal plan content is required" },
        { status: 400 }
      );
    }
    
    console.log("Calling saveMealPlan with valid parameters");
    
    try {
      // Save the meal plan with the optional plan name
      const result = await saveMealPlan(userId, mealPlanContent, planName);
      console.log("Meal plan saved successfully, returning result");
      
      return NextResponse.json({ 
        success: true, 
        mealPlan: result
      });
    } catch (saveError: any) {
      console.error("Error in saveMealPlan function:", saveError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Database error while saving meal plan",
          details: saveError.message,
          stack: saveError.stack
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in save-meal-plan route:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Server error processing save request",
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 