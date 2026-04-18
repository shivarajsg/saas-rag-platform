import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase admin client with service role key
// Note: In production, this should be server-side only
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a single supabase client for interacting with your database
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Function to create a user in the database
export async function createUser(userId: string, username: string, email: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .insert([{ id: userId, username, email }]);
    
  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }
  
  return { success: true };
}

// Function to find a user by username
export async function findUserByUsername(username: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('username', username)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }
  
  return data;
} 