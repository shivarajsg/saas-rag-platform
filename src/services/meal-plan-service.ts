import { supabase } from '@/lib/supabase';
import { MealPlan } from '@/types/meal-plan';

export class MealPlanService {
  /**
   * Save a meal plan to the database
   * @param userId Supabase user ID
   * @param mealPlanContent The content of the meal plan
   * @param planName Optional plan name
   */
  static async saveMealPlan(userId: string, mealPlanContent: string, planName?: string): Promise<MealPlan> {
    if (!userId || !mealPlanContent) {
      throw new Error("User ID and meal plan content are required");
    }

    // Use provided plan name or create a default one
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const mpName = planName && planName.trim() 
      ? planName.trim() 
      : `Meal Plan (${timestamp})`;
    const currentTime = new Date().toISOString();
    
    // Insert the new meal plan
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
      // Handle duplicate name error
      if (error.code === '23505') {
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
          throw new Error(`Database error (retry failed): ${retryError.message}`);
        }
        
        if (retryData && retryData.length > 0) {
          return retryData[0] as MealPlan;
        }
      }
      
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      // Return a simulated response for the frontend
      return { 
        username: userId,
        mp_name: mpName,
        mp: mealPlanContent,
        created_at: currentTime
      };
    }
    
    return data[0] as MealPlan;
  }

  /**
   * Get all meal plans for a user
   * @param userId Supabase user ID
   */
  static async getMealPlans(userId: string): Promise<MealPlan[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

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
        id: plan.id || `${index}-${plan.mp_name}`,
        created_at: createdAt
      };
    }) : [];
  }

  /**
   * Update a meal plan's name
   * @param planId The plan ID or synthetic ID
   * @param newName The new name
   * @param userId The user ID to verify ownership
   */
  static async updateMealPlanName(planId: string, newName: string, userId: string): Promise<MealPlan> {
    if (!planId || !newName) {
      throw new Error("Plan ID and new name are required");
    }
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`Updating meal plan ${planId} to new name: "${newName}" for user ${userId}`);
    
    // First check if the ID is numeric or a synthetic ID
    const isNumericId = /^\d+$/.test(planId);
    
    let data, error;
    
    // If it's a numeric ID, we can directly update by ID and username
    if (isNumericId) {
      console.log(`Using numeric ID approach: ${planId}`);
      const response = await supabase
        .from('saved_mps')
        .update({ mp_name: newName })
        .eq('id', parseInt(planId, 10))
        .eq('username', userId)
        .select();
      
      data = response.data;
      error = response.error;
    } else {
      // If it's a synthetic ID (format: "index-name"), parse out the name
      const nameParts = planId.split('-');
      if (nameParts.length < 2) {
        throw new Error("Invalid plan ID format");
      }
      
      // The name is everything after the first dash
      const planName = nameParts.slice(1).join('-');
      console.log(`Using name-based approach: "${planName}"`);
      
      // Update by name and username
      const response = await supabase
        .from('saved_mps')
        .update({ mp_name: newName })
        .eq('mp_name', planName)
        .eq('username', userId)
        .select();
      
      data = response.data;
      error = response.error;
      
      // If no rows updated, try falling back to find by part of the name
      if ((!data || data.length === 0) && !error) {
        console.log(`No exact name match, trying to find plan containing: "${planName}"`);
        
        // First find the plan
        const { data: matchingPlans, error: findError } = await supabase
          .from('saved_mps')
          .select('*')
          .eq('username', userId)
          .ilike('mp_name', `%${planName}%`)
          .limit(1);
        
        if (findError) {
          console.error("Error finding plan by partial name:", findError);
          throw findError;
        }
        
        if (matchingPlans && matchingPlans.length > 0) {
          console.log(`Found matching plan with ID: ${matchingPlans[0].id}`);
          
          // Now update the found plan
          const updateResponse = await supabase
            .from('saved_mps')
            .update({ mp_name: newName })
            .eq('id', matchingPlans[0].id)
            .eq('username', userId)
            .select();
          
          data = updateResponse.data;
          error = updateResponse.error;
        }
      }
    }
    
    if (error) {
      console.error('Error updating meal plan name:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("Failed to update meal plan or plan not found");
    }
    
    console.log(`Successfully updated meal plan to "${newName}"`);
    return data[0] as MealPlan;
  }

  /**
   * Delete a meal plan
   * @param planId The plan ID or name
   * @param userId The user ID to verify ownership
   */
  static async deleteMealPlan(planId: string, userId: string): Promise<void> {
    if (!planId) {
      throw new Error("Plan ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // First check if the ID is numeric or a synthetic ID
    const isNumericId = /^\d+$/.test(planId);
    
    // If it's a numeric ID, we can directly delete by ID and username
    if (isNumericId) {
      const { error } = await supabase
        .from('saved_mps')
        .delete()
        .eq('id', parseInt(planId, 10))
        .eq('username', userId);
      
      if (error) {
        console.error('Error deleting meal plan by ID:', error);
        throw error;
      }
      return;
    }
    
    // If it's a synthetic ID (format: "index-name"), parse out the name
    const nameParts = planId.split('-');
    if (nameParts.length < 2) {
      throw new Error("Invalid plan ID format");
    }
    
    // The name is everything after the first dash
    const planName = nameParts.slice(1).join('-');
    
    // Delete by name and username
    const { error } = await supabase
      .from('saved_mps')
      .delete()
      .eq('mp_name', planName)
      .eq('username', userId);
    
    if (error) {
      console.error('Error deleting meal plan by name:', error);
      throw error;
    }
  }

  /**
   * Count the number of meal plans for a user
   * @param userId Supabase user ID
   */
  static async getMealPlanCount(userId: string): Promise<number> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { count, error } = await supabase
      .from('saved_mps')
      .select('*', { count: 'exact', head: true })
      .eq('username', userId);
    
    if (error) throw error;
    
    return count || 0;
  }
} 