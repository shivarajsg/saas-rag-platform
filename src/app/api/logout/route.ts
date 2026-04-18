import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
    
    // Clear the authentication cookie
    response.cookies.set('currentUser', '', { 
      httpOnly: true,
      expires: new Date(0), // Expire immediately
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
} 