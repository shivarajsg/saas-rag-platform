import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    
    // Try direct insertion
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ username, password }]);
    
    if (!insertError) {
      return NextResponse.json({ success: true, message: "User created successfully" });
    }
    
    console.error("Insert error:", insertError);
    
    // Handle specific errors
    if (insertError.code === '23505') { // Unique violation
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "An error occurred", details: error }, { status: 500 });
  }
} 