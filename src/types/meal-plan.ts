export interface MealPlan {
  username: string;
  mp_name: string;
  mp: string;
  created_at?: string;
  id?: string; 
}

export interface MealPlanDay {
  date: string;
  meals: {
    [meal: string]: {
      recipe: string;
      ingredients: string[];
    }
  }
} 