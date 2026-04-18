import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with hardcoded values for browser use
// This approach works better in Next.js when browser-side code needs to access Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SSUPABASE_ANON_KEY || '';

// Validate credentials before client creation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Client will not function correctly.');
}

// Create the client with extra options for better debugging
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    // Log client errors to console
    fetch: (url, options) => {
      return fetch(url, options)
        .then(response => {
          if (!response.ok) {
            console.warn(`Supabase request failed: ${response.status} ${response.statusText}`);
          }
          return response;
        })
        .catch(error => {
          console.error('Supabase fetch error:', error);
          throw error;
        });
    }
  }
});

// Perform a simple test query to check connectivity
(async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('saved_mps').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      if (error.code === '42P01') {
        console.error('Table "saved_mps" does not exist. Database schema may be incorrect.');
      }
    } else {
      console.log('Supabase connection successful. Database is accessible.');
    }
  } catch (e) {
    console.error('Error testing Supabase connection:', e);
  }
})(); 