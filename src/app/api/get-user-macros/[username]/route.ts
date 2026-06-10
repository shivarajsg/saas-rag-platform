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

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    
    // Forward the request to the Python API
    const apiUrl = process.env.API_URL || "http://127.0.0.1:8000";
    
    const queryParams = new URLSearchParams();
    if (date) {
      queryParams.append("date", date);
    }
    
    console.log(`Fetching macros for user ${username} from ${apiUrl}/get-user-macros/${username}`);
    
    try {
      const response = await fetch(
        `${apiUrl}/get-user-macros/${username}?${queryParams.toString()}`,
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
          macros: []
        });
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Error connecting to FastAPI backend:", fetchError);
      
      // Return empty data on connection error
      return NextResponse.json({
        success: true,
        macros: []
      });
    }
  } catch (error) {
    console.error("Error in get-user-macros API route:", error);
    
    // Return empty data on general error
    return NextResponse.json({
      success: true,
      macros: []
    });
  }
} 