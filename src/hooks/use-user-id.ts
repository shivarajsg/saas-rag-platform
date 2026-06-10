import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to get the authenticated user's ID
 * If the user is authenticated with Supabase, returns their UID
 * Otherwise fallbacks to a locally stored ID in localStorage
 */
export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // First try to get the authenticated user from Supabase
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.id) {
          // Use the authenticated user's ID
          setUserId(user.id);
          // Also store in localStorage for compatibility with existing code
          localStorage.setItem('mealplan_user_id', user.id);
        } else {
          // Fallback to localStorage stored ID
          let storedId = localStorage.getItem('mealplan_user_id');
          
          if (!storedId) {
            // Generate a new ID if none exists
            storedId = uuidv4();
            localStorage.setItem('mealplan_user_id', storedId);
          }
          
          setUserId(storedId);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
        // Fallback to localStorage on error
        let storedId = localStorage.getItem('mealplan_user_id');
        
        if (!storedId) {
          storedId = uuidv4();
          localStorage.setItem('mealplan_user_id', storedId);
        }
        
        setUserId(storedId);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        localStorage.setItem('mealplan_user_id', session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { userId, loading };
} 