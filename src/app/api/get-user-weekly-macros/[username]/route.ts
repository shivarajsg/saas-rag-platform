import { NextRequest, NextResponse } from "next/server";

// Updated type to match NextJS expected pattern
type RouteParams = {
  params: {
    username: string;
  };
}

export async function GET(
  req: NextRequest, 
  context: RouteParams
) {
  // Use proper error handling with try-catch
  try {
    // Await the params object to satisfy Next.js warning
    const params = await Promise.resolve(context.params);
    const username = params.username;
    
    if (!username) {
      console.error("Username parameter is missing");
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    // Calculate date range (7 days ago to today)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // 7 days including today
    
    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Forward the request to the Python API
    const apiUrl = process.env.API_URL || "http://127.0.0.1:8000";
    
    console.log(`Fetching weekly macros for user ${username} from ${startDateStr} to ${endDateStr}`);
    
    try {
      // Use explicit date parameters with proper formatting
      const response = await fetch(
        `${apiUrl}/get-user-weekly-macros/${username}?start_date=${startDateStr}&end_date=${endDateStr}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from Python API: ${response.status} - ${errorText}`);
        
        // Return empty data for development instead of error
        return NextResponse.json({
          success: true,
          daily_summary: {},
          weekly_totals: {
            calories: 0,
            proteins: 0,
            carbs: 0,
            fats: 0,
          },
          daily_averages: {
            calories: 0,
            proteins: 0,
            carbs: 0,
            fats: 0
          },
          date_range: {
            start_date: startDateStr,
            end_date: endDateStr
          }
        });
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Error connecting to FastAPI backend:", fetchError);
      
      // Return empty data structure on connection error
      return NextResponse.json({
        success: true,
        daily_summary: {},
        weekly_totals: {
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0,
        },
        daily_averages: {
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0
        },
        date_range: {
          start_date: startDateStr,
          end_date: endDateStr
        }
      });
    }
  } catch (error) {
    console.error("Error in get-user-weekly-macros API route:", error);
    
    // Calculate fallback dates for the error case
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];
    
    // Return empty data structure with proper date range
    return NextResponse.json({
      success: true,
      daily_summary: {},
      weekly_totals: {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fats: 0,
      },
      daily_averages: {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fats: 0
      },
      date_range: {
        start_date: startDateStr,
        end_date: endDateStr
      }
    });
  }
} 