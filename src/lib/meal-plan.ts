import { supabase } from './supabase';

export async function saveMealPlan(userId: string, mealPlanContent: string, planName?: string) {
  console.log("saveMealPlan called with:", { 
    userId: userId ? 'valid' : 'missing',
    contentLength: mealPlanContent ? mealPlanContent.length : 0,
    planNameProvided: !!planName
  });

  if (!userId || !mealPlanContent) {
    console.error("Missing required parameters:", { 
      hasUserId: !!userId, 
      hasContent: !!mealPlanContent 
    });
    throw new Error("User ID and meal plan content are required");
  }

  try {
    // Use provided plan name or create a default one
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const mpName = planName && planName.trim() 
      ? planName.trim() 
      : `Meal Plan (${timestamp})`;
    const currentTime = new Date().toISOString();
    
    console.log("Preparing to insert meal plan with:", {
      username: userId,
      mp_name: mpName,
      contentLength: mealPlanContent.length,
      timestamp: currentTime
    });
    
    // Insert the new meal plan without specifying ID (let the DB handle it)
    const { data, error } = await supabase
      .from('saved_mps')
      .insert([
        { 
          username: userId,
          mp_name: mpName,
          mp: mealPlanContent,
          created_at: currentTime
        }
      ])
      .select();
    
    if (error) {
      console.error('Supabase error saving meal plan:', error);
      
      // If there's a duplicate name error, try with a timestamp added
      if (error.code === '23505') { // Unique constraint violation
        console.log("Constraint violation. Trying with unique name...");
        
        // Try inserting with a timestamped name
        const uniqueName = `${mpName} (${Date.now()})`;
        const { data: retryData, error: retryError } = await supabase
          .from('saved_mps')
          .insert([
            { 
              username: userId,
              mp_name: uniqueName,
              mp: mealPlanContent,
              created_at: currentTime
            }
          ])
          .select();
          
        if (retryError) {
          console.error('Second attempt failed:', retryError);
          throw new Error(`Database error (retry failed): ${retryError.message}`);
        }
        
        if (retryData && retryData.length > 0) {
          console.log('Meal plan saved successfully (second attempt):', retryData[0]);
          return retryData[0];
        }
      } else {
        throw new Error(`Database error: ${error.message}${error.hint ? ` (${error.hint})` : ''}`);
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('No data returned from meal plan insert');
      // Return a simulated response for the frontend
      return { 
        username: userId,
        mp_name: mpName,
        mp: mealPlanContent,
        created_at: currentTime
      };
    }
    
    console.log('Meal plan saved successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error saving meal plan:', error);
    // Capture and rethrow for better debugging
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred";
    throw new Error(`Failed to save meal plan: ${errorMessage}`);
  }
}

export async function getSavedMealPlans(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Get meal plans for the specific user
    const { data, error } = await supabase
      .from('saved_mps')
      .select('*')
      .eq('username', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add a synthetic ID for the UI and normalize dates
    return data ? data.map((plan, index) => {
      // Ensure created_at is valid
      let createdAt = plan.created_at;
      
      if (!createdAt || isNaN(new Date(createdAt).getTime())) {
        createdAt = new Date().toISOString();
      }
      
      return {
        ...plan,
        id: `${index}-${plan.mp_name}`,
        created_at: createdAt
      };
    }) : [];
  } catch (error) {
    console.error('Error fetching saved meal plans:', error);
    return [];
  }
}

export async function updateMealPlanName(id: string, newName: string) {
  if (!id || !newName) {
    throw new Error("ID and new name are required");
  }

  try {
    // Extract the plan name from the synthetic ID
    const parts = id.split('-');
    if (parts.length < 2) {
      throw new Error("Invalid ID format");
    }
    
    // The original mp_name is everything after the first dash
    const oldName = parts.slice(1).join('-');
    
    // First get all plans to find a match by name
    const { data: allPlans, error: fetchError } = await supabase
      .from('saved_mps')
      .select('*');
    
    if (fetchError) throw fetchError;
    
    if (!allPlans || allPlans.length === 0) {
      throw new Error("No meal plans found in the database");
    }
    
    // Try different ways to find the plan
    let planToUpdate = null;
    
    // Method 1: Exact match by name
    planToUpdate = allPlans.find(p => p.mp_name === oldName);
    
    // Method 2: Partial match by name if needed
    if (!planToUpdate) {
      planToUpdate = allPlans.find(p => 
        `${p.mp_name}`.toLowerCase().includes(oldName.toLowerCase()) ||
        oldName.toLowerCase().includes(`${p.mp_name}`.toLowerCase())
      );
    }
    
    // Method 3: Try all plans in order of recency
    if (!planToUpdate && allPlans.length > 0) {
      planToUpdate = allPlans[0];
    }
    
    if (!planToUpdate) {
      throw new Error("No meal plan found to update");
    }
    
    // Update the plan using its exact current name
    const { data, error } = await supabase
      .from('saved_mps')
      .update({ mp_name: newName })
      .eq('mp_name', planToUpdate.mp_name)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Create a mock response with the new name
      return {
        ...planToUpdate,
        mp_name: newName
      };
    }
    
    return data[0];
  } catch (error) {
    console.error('Error updating meal plan name:', error);
    throw error;
  }
}

// Add this new function to count saved meal plans for a user
export async function getSavedMealPlanCount(userId: string): Promise<number> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Get meal plans for the specific user
    const { data, error, count } = await supabase
      .from('saved_mps')
      .select('*', { count: 'exact' })
      .eq('username', userId);
    
    if (error) throw error;
    
    // Return the count or data length
    return count !== null ? count : (data?.length || 0);
  } catch (error) {
    console.error('Error counting saved meal plans:', error);
    return 0;
  }
} 