import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    
    // Check credentials against the users table
    // First try with the Supabase client
    const { data: user, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (user) {
      // If credentials are valid, set cookie and return success
      const response = NextResponse.json({ 
        success: true, 
        message: "Logged in successfully",
        user: { username: user.username }
      });
      
      // Set the cookie in the response
      response.cookies.set('currentUser', username, { 
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      
      return response;
    }
    
    // If normal query fails, try SQL approach
    if (error && error.code === '42501') { // RLS policy violation
      try {
        const sqlResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({
            query: `
              SELECT username FROM public.users 
              WHERE username = '${username}' AND password = '${password}' 
              LIMIT 1;
            `
          })
        });
        
        const sqlResult = await sqlResponse.json();
        
        if (sqlResponse.ok && sqlResult && sqlResult.length > 0) {
          // Credentials valid, set cookie and return success
          const response = NextResponse.json({ 
            success: true, 
            message: "Logged in successfully via SQL",
            user: { username: username }
          });
          
          // Set the cookie in the response
          response.cookies.set('currentUser', username, { 
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
          });
          
          return response;
        }
      } catch (sqlError) {
        console.error("SQL login error:", sqlError);
      }
    }
    
    // No valid user found or other error
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "An error occurred during login", details: error }, { status: 500 });
  }
} 