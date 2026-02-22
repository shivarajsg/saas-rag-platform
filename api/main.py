import os
import sys
import logging
from typing import List, Optional
import base64
import tempfile
from datetime import datetime, timedelta
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import re

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    logger.info("Environment variables loaded from .env file")
except ImportError:
    logger.warning("python-dotenv not installed. Using environment variables directly.")

# Try to import CrewAI dependencies
try:
    from crewai import Agent, Task, Crew, LLM
    from crewai.memory.short_term.short_term_memory import ShortTermMemory
    from crewai.memory.long_term.long_term_memory import LongTermMemory
    from crewai.memory.entity.entity_memory import EntityMemory
    from crewai.memory.storage.rag_storage import RAGStorage
    from crewai.memory.storage.ltm_sqlite_storage import LTMSQLiteStorage
    from crewai.tools import tool
    from sentence_transformers import SentenceTransformer
    from qdrant_client import QdrantClient
    import torch
    
    # Initialize embedding model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2').to(device)

    # Initialize Qdrant client
    qdrant = QdrantClient(
        url=os.environ.get("QDRANT_URL"),
        api_key=os.environ.get("QDRANT_API_KEY")
    )
    
    embedder_config = {
    "provider": "cohere",
    "config": {
        "api_key": os.environ.get("COHERE_API_KEY"),
        "model": "embed-english-v3.0",
        }
    }

    # Vector search tool
    @tool("Vector Search Tool")
    def vector_search(query: str) -> str:
        """Search recipes vector database using semantic embeddings."""
        assert isinstance(query, str), "Your search query must be a string"
        query_vector = embedding_model.encode(query).tolist()
        results = qdrant.search(
            collection_name="recipe_data",
            query_vector=query_vector,
            limit=5,
        )
        return "Retrieved recipes:\n\n".join([str(result.payload) for result in results])
    
    
    # Configure LLM with Llama3.3 70B provided by SambaNova
    llm = LLM(
    model="sambanova/Meta-Llama-3.3-70B-Instruct",
    api_key=os.environ.get("SAMBANOVA_API_KEY")
    )
    
    # Setting the role, goal and backstory of the agent
    role = "You are a professional meal prep specialist and nutritionist with expertise in creating efficient and customized weekly meal plans using the help of external tools."
    goal = """Task: 
    The user will provide details about the ingredients they have, dietary restrictions, allergy information, and their daily protein target. 
    Using the tools provided to you, create three distinct recipes-one for breakfast, one for lunch, and one for dinner-that the user will repeat daily for 7 days. Also suggest one recipe for a mid-day snack that they can use to get additional protein. 
    Each recipe should include specific ingredient quantities for meal prepping for 7 servings, ensuring each serving meets or closely aligns with the user's daily protein target when divided across meals."""
    backstory = """Instructions:
    Step 1: Analyze the user's input to understand the ingredients they have, their dietary restrictions, allergies, and daily protein target.
    Step 2: Using the "vector_search" tool, query the vector database appropriately to retrieve relevant recipes based on the user's input. If the tool does not return sufficient recipes or if the recipes do not match the user's requirements, generate custom recipes by combining similar techniques and ingredient profiles.
    Step 3: Follow the guidelines stated below and create the meal plan for the user.
    
    Guidelines: 
    1. Dietary and Allergy Compliance: Ensure recipes strictly adhere to the user's dietary restrictions and allergies.  
    2. Protein Target: Use the daily protein target provided by the user to guide recipe creation. Ensure the protein content of each serving from breakfast, lunch, and dinner combines to meet or is as close as possible to the target. Distribute the protein evenly across meals or based on meal size.
    3. Ingredient Utilization: Maximize the use of the user-provided ingredients. If additional ingredients are required, include them in the ingredients list and tag them as "Must be purchased."
    4. Nutritional Information: Provide the nutritional details (calories, protein, fats, and carbohydrates) for one serving of each meal. Do this only after the recipe is finalized.
    5. Meal Prep Quantities: Clearly indicate the total quantity of each ingredient needed to prepare all 7 servings of the recipe.  
    6. Preparation Instructions: Include concise, step-by-step instructions for preparing each recipe, suitable for batch cooking and storage.
    7. Formatting: Present the meal plan in a clear, organized and human readable format.
    8. Off-topic Questions: Respond only to inquiries directly related to the user's meal plan or food-related questions. Avoid addressing any off-topic questions and if the user asks non meal-plan or non food-related questions, respond with: "I'm sorry, but I can only assist with meal planning and food-related inquiries."""
    
    # Meal planning agent
    meal_planner_agent = Agent(
        role=role,
        goal=goal,
        backstory=backstory,
        llm=llm,
        tools=[vector_search],
        verbose=False,
        memory=True,
    )
    
    # Setting the output format
    output_format = """
    ### 🍽️ **Weekly Meal Plan**
    
    Based on your provided ingredients, dietary preferences, restrictions, and daily protein goal, here is your customized meal plan. Each recipe is designed for 7 servings (meal prep for the whole week).
    
    ### 🥞 **Breakfast Recipe: [title]**
    
    **Ingredients (for 7 servings):**
    
    [list of ingredidents along with their quantities]
    
    **Nutritional information (per serving):**
    
    | Calories | Protein | Carbs | Fats |
    |----------|---------|-------|------|
    | [amount of kcal] | [amount of protein] | [amount of carbs]  | [amount of fats] |
    
    **Preparation Instructions:**
    
    [list of instructions]
    
    ### 🥗 **Lunch Recipe: [title]**
    
    **Ingredients (for 7 servings):**
    
    [list of ingredidents along with their quantities]
    
    **Nutritional information (per serving):**
    
    | Calories | Protein | Carbs | Fats |
    |----------|---------|-------|------|
    | [amount of kcal] | [amount of protein] | [amount of carbs]  | [amount of fats] |
    
    **Preparation Instructions:**
    
    [list of instructions]
    
    ### 🍲 **Dinner Recipe: [title]**
    
    **Ingredients (for 7 servings):**
    
    [list of ingredidents along with their quantities]
    
    **Nutritional information (per serving):**
    
    | Calories | Protein | Carbs | Fats |
    |----------|---------|-------|------|
    | [amount of kcal] | [amount of protein] | [amount of carbs]  | [amount of fats] |
    
    **Preparation Instructions:**
    
    [list of instructions]
    
    ### 🍿 **Mid-Day Protein Snack Idea**
    
    - [Title]
    
    **Ingredients (for 7 servings):**
    
    [list of ingredidents along with their quantities]
    
    **Nutritional information (per serving):**
    
    | Calories | Protein | Carbs | Fats |
    |----------|---------|-------|------|
    | [amount of kcal] | [amount of protein] | [amount of carbs]  | [amount of fats] |
    
    **Preparation Instructions:**
    
    [list of instructions]
    
    ### 📊 **Weekly Meal Plan Macros Summary**
    
    | Meal           |  Calories (kcal) |  Protein (g) |   Carbs (g)  |   Fats (g)   |
    |----------------|------------------|--------------|--------------|--------------|
    | Breakfast      | XXX kcal/serving | XX g/serving | XX g/serving | XX g/serving |
    | Lunch          | XXX kcal/serving | XX g/serving | XX g/serving | XX g/serving |
    | Dinner         | XXX kcal/serving | XX g/serving | XX g/serving | XX g/serving |
    | Mid-day Snack  | XXX kcal/serving | XX g/serving | XX g/serving | XX g/serving |
    | Daily Total    | XXX kcal/serving | XX g/serving | XX g/serving | XX g/serving |
    | Weekly Total (7 days) | XXX kcal  | XX g         | XX g         | XX g         |
    
    ### 🛒 **Additional Ingredients (Must be Purchased):**
    
    - [Ingredient] (meal)
    Repeat for all extra ingredients.
    
    Only include the additional ingredients part if there are any additional ingredients.
    """
    
    # Function to create a meal plan based on user input
    @tool("Create Meal Plan")
    def create_meal_plan(user_input: str):
        """This tool creates a crew and gives them a task to create a meal plan for the user and returns the meal plan as the output."""
        assert isinstance(user_input, str), "User input must be a string"
    
        # Create the crew
        meal_planning_crew = Crew(
            agents=[meal_planner_agent],
            tasks=[],
            verbose=False,
            memory=True,
            embedder=embedder_config,
            long_term_memory=LongTermMemory(
                storage=LTMSQLiteStorage(
                    db_path="/long_term/long_term_memory_storage.db"
                    )
                ),
            short_term_memory=ShortTermMemory(
                storage=RAGStorage(
                    type="short_term",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="short_term"
                )
            ),
            entity_memory=EntityMemory(
                storage=RAGStorage(
                    type="entities",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="entity_memory"
                )
            )
        )
    
        # Create the task
        meal_planning_task = Task(
            description=f"Create a complete weekly meal plan based on the user's input.\n\n{user_input}",
            expected_output=output_format,
            agent=meal_planner_agent,
            verbose=False,
        )

        # Add the task to the crew
        meal_planning_crew.tasks = [meal_planning_task]
        
        # Execute the crew,
        meal_plan = meal_planning_crew.kickoff()
        
        return meal_plan.raw
    
    @tool("Answer Follow-up Question")
    def followup_answer(user_input: str):
        """This tool creates a crew and gives them a task to answer follow-up questions related to the user's meal plan or food in general and returns the answer as the output."""
        assert isinstance(user_input, str), "User input must be a string"
    
        answering_crew = Crew(
            agents=[meal_planner_agent],
            tasks=[],
            verbose=False,
            memory=True,
            embedder=embedder_config,
            long_term_memory=LongTermMemory(
                storage=LTMSQLiteStorage(
                    db_path="/long_term/long_term_memory_storage.db"
                    )
                ),
            short_term_memory=ShortTermMemory(
                storage=RAGStorage(
                    type="short_term",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="short_term"
                )
            ),
            entity_memory=EntityMemory(
                storage=RAGStorage(
                    type="entities",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="entity_memory"
                )
            )
        )
    
        answering_task = Task(
            description=f"Answer the user's follow-up question. Use any of the tools given to you if neccessary to answer the user's query. Do not answer any unrelated/off-topic questions.\n\n{user_input}",
            expected_output="Make sure all answers are in a human readable format.",
            agent=meal_planner_agent,
            verbose=False,
        )
    
        # Add the task to the crew
        answering_crew.tasks = [answering_task]
        
        # Execute the crew,
        ans = answering_crew.kickoff()
    
        return ans.raw
    
    @tool("Save Meal Plan")
    def save_mp(user_input: str):
        """This tool creates a crew and gives them a task to output the user's final meal plan."""
        assert isinstance(user_input, str), "User input must be a string"
    
        saving_crew = Crew(
            agents=[meal_planner_agent],
            tasks=[],
            verbose=False,
            memory=True,
            embedder=embedder_config,
            long_term_memory=LongTermMemory(
                storage=LTMSQLiteStorage(
                    db_path="/long_term/long_term_memory_storage.db"
                    )
                ),
            short_term_memory=ShortTermMemory(
                storage=RAGStorage(
                    type="short_term",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="short_term"
                )
            ),
            entity_memory=EntityMemory(
                storage=RAGStorage(
                    type="entities",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="entity_memory"
                )
            )
        )
    
        saving_task = Task(
            description="Recall from memory and output the latest version of the user's meal plan.",
            expected_output=output_format,
            agent=meal_planner_agent,
            verbose=False,
        )
    
        # Add the task to the crew
        saving_crew.tasks = [saving_task]
        
        # Execute the crew,
        meal_plan = saving_crew.kickoff()
    
        return meal_plan.raw
    
    main_agent = Agent(
        role="You are an expert manager with exceptional decision making skills who has 30+ years successfully managing employees.",
        goal="The user will give an input and you have to decide which function to pass the user's input to. Each function gives a different response to the user.",
        backstory="You are helping the user either create a meal plan or get answer's to follow-up questions related to their meal plan or food in general.",
        llm=llm,
        tools=[create_meal_plan, followup_answer, save_mp],
        verbose=False,
        allow_delegation=True,
        memory=True
    )
    
    def ans_user(user_input: str):
        final_crew = Crew(
            agents=[main_agent],
            tasks=[],
            verbose=False,
            memory=True,
            embedder=embedder_config,
            long_term_memory=LongTermMemory(
                storage=LTMSQLiteStorage(
                    db_path="/long_term/long_term_memory_storage.db"
                )
            ),
            short_term_memory=ShortTermMemory(
                storage=RAGStorage(
                    type="short_term",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="short_term"
                )
            ),
            entity_memory=EntityMemory(
                storage=RAGStorage(
                    type="entities",
                    allow_reset=True,
                    embedder_config=embedder_config,
                    path="entity_memory"
                )
            )
        )
    
        final_task = Task(
            description=f"""Decide the correct tool to invoke based on the user's input:
    
    - If the user input requests a new or complete meal plan (e.g., mentions ingredients, dietary restrictions, allergies, protein targets, or explicitly asks for a weekly or structured meal plan), invoke the 'Create Meal Plan' tool by passing the user's input.
    
    - For general follow-up questions, clarifications, queries realted to their meal plan or food in general, or specific requests not requiring a full structured meal plan, invoke the 'Answer Follow-up Question' tool by passing the user's input.
    
    - If the user wants to save their meal plan, invoke the 'Save Meal Plan' tool.
    
    {user_input}
    
    IMPORTANT: Your response should ONLY be the output of the selected tool. Do NOT add additional commentary or explanations. No preamble.""",
            expected_output="",
            agent=main_agent,
            verbose=False,
        )

        # Add the task to the crew
        final_crew.tasks = [final_task]
        
        # Execute the crew,
        final_ans = final_crew.kickoff()
    
        return final_ans.raw
    
    CREWAI_AVAILABLE = True
    logger.info("Successfully imported CrewAI dependencies")
    
except ImportError as e:
    CREWAI_AVAILABLE = False
    logger.warning(f"CrewAI dependencies not available: {e}. Chat and meal planning features will be limited.")

# Function to encode the image
def encode_image(image_path):
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image: {e}")
        raise

# Function to get ingredients using SambaNova API
def get_ingredients(image_path):
    # Encode the image
    base64_image = encode_image(image_path)

    headers = {
        "Authorization": f"Bearer {os.environ.get('SAMBANOVA_API_KEY')}",
        "Content-Type": "application/json"
    }

    # Define the prompt
    prompt = """Act like a professional food image analyst with expertise in culinary ingredients. You specialize in identifying and categorizing food items that can be used as recipe ingredients. 
Objective: Analyze the provided image to identify all food items present that could serve as ingredients in cooking or baking. 
Instructions: 
1. Examine the image carefully to identify visible food items. 
2. Cross-reference each identified food item with commonly used culinary ingredients. 
3. Output the list of identified ingredients only. Do not include additional text, explanations, or non-ingredient items. 
4. Present the output as a comma-separated list. 
Example Output Format: tomato, basil, garlic, olive oil, salt, pepper
Note: You have to return only a comma-separated list of ingredients and absolutely nothing else. No explanations, no other text, NO PREAMBLE. Just the list of ingredients."""
    
    # Set up the API request
    data = {
        "model": "Llama-3.2-11B-Vision-Instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
    }

    # Setting the API URL
    url = "https://api.sambanova.ai/v1/chat/completions"
    
    try:
        logger.info("Sending request to SambaNova API")
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"SambaNova API error: {response.status_code} - {response.text}")
            raise Exception(f"SambaNova API returned status code {response.status_code}: {response.text}")
        
        result = response.json()["choices"][0]["message"]["content"]
        logger.info(f"SambaNova API response received: {result[:50]}...")
        return result
    except Exception as e:
        logger.error(f"Error calling SambaNova API: {str(e)}")
        raise

def get_macros(food_name, image_path):
    # Getting the base64 string
    base64_image = encode_image(image_path)

    # Set up the API request
    headers = {
        "Authorization": f"Bearer {os.environ.get('SAMBANOVA_API_KEY')}",
        "Content-Type": "application/json"
    }

    prompt = """Act like a professional nutrition analyst specializing in food macro analysis with 30+ years of experience. You are an expert in estimating the macronutrient content of food items using visual and textual inputs.  

You will be provided with:  
1. An image of a food item.  
2. The name of the food item.  

Your task:  
- Analyze the image and the given food name to determine the estimated macronutrient values.  
- Identify and extract the following macronutrient data:  
    - Calories (kcal)  
    - Protein (g) 
    - Fats (g)  
    - Carbohydrates (g)

Output format:  
- Strictly output only the macronutrient information in pure JSON format with the following structure:  

{
    "calories": <value in kcal>,
    "protein": <value in grams>,
    "fats": <value in grams>,
    "carbs": <value in grams>
}

Instructions:
- Do not include any additional text, explanations, or comments. Only return the JSON object.
- It is also understood that the calories are in kcal and protein, fats, and carbohydrates are in grams so in the JSON output you do not need to provide the units, only the values are required.
- It is also understood that this is an estimate only and not an exact measurement so you do not need to provide any kind of warnings. Just stick to the JSON output format provided to you.
- Do not give any decimal values, only whole numbers.
- No preamble.

Follow the instructions strictly and complete your task correctly.

Name of the food item is: """ + f"""{food_name}."""

    # Build the request payload
    data = {
        "model": "Llama-3.2-11B-Vision-Instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
    }

    # Setting the API URL
    url = "https://api.sambanova.ai/v1/chat/completions"
    
    try:
        logger.info("Sending request to SambaNova API")
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"SambaNova API error: {response.status_code} - {response.text}")
            raise Exception(f"SambaNova API returned status code {response.status_code}: {response.text}")
        
        result = response.json()["choices"][0]["message"]["content"]
        logger.info(f"SambaNova API response received: {result[:50]}...")
        return result
    except Exception as e:
        logger.error(f"Error calling SambaNova API: {str(e)}")
        raise

# Create FastAPI app
app = FastAPI(title="Meal Planner API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Data Models -----
class IngredientResponse(BaseModel):
    success: bool
    ingredients: List[str]

class ChatRequest(BaseModel):
    message: str
    user_id: str
    ingredients: Optional[List[str]] = None
    dietaryRestrictions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    proteinTarget: Optional[int] = None
    is_initial_message: bool = False

class ChatResponse(BaseModel):
    message: str
    timestamp: str
    user_avatar: str = "👤"
    bot_avatar: str = "🤖"

class MacroAnalysisRequest(BaseModel):
    food_name: str

@app.get("/")
async def root():
    return {"status": "API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "crewai_available": CREWAI_AVAILABLE
    }

@app.post("/identify-ingredients", response_model=IngredientResponse)
async def identify_ingredients(file: UploadFile = File(...)):
    """
    Upload an image to identify ingredients
    """
    # Check if the file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")
    
    try:
        logger.info(f"Received image: {file.filename}")
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
            contents = await file.read()
            temp.write(contents)
            temp_path = temp.name
        
        logger.info(f"Image saved to temporary file: {temp_path}")
        
        # Get ingredients from the image
        result = get_ingredients(temp_path)
        
        # Parse the comma-separated list into an actual list
        ingredients = [item.strip() for item in result.split(',')]
        logger.info(f"Identified ingredients: {ingredients}")
        
        # Remove the temporary file
        os.unlink(temp_path)
        
        return {
            "success": True,
            "ingredients": ingredients
        }
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the meal planning assistant
    """
    try:
        logger.info(f"Received chat message from user {request.user_id}")
        
        if not CREWAI_AVAILABLE:
            # Return a simple response if CrewAI is not available
            return ChatResponse(
                message="I'm sorry, but the meal planning assistant is not available at the moment. The required dependencies are missing.",
                timestamp=datetime.now().isoformat()
            )
        
        # Build the input for the CrewAI agent
        if request.is_initial_message:
            # Format the initial message for meal plan generation
            formatted_input = f"""
            Ingredients: {', '.join(request.ingredients) if request.ingredients else 'None provided'}  

            Dietary Restrictions: {', '.join(request.dietaryRestrictions) if request.dietaryRestrictions else 'None'}

            Allergy Information: {', '.join(request.allergies) if request.allergies else 'None'}

            Daily Protein Target: {request.proteinTarget if request.proteinTarget else 'Not specified'} grams
            """
            logger.info(f"Initial message formatted for meal plan generation")
            response = ans_user(formatted_input)
        else:
            # For follow-up messages, use the message directly
            response = ans_user(request.message)
        
        logger.info(f"CrewAI response generated: {response[:50]}...")
        return ChatResponse(
            message=response,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/analyze-food-macros")
async def analyze_food_macros(food_name: str = None, file: UploadFile = File(...)):
    """
    Upload an image of food to analyze macros
    """
    # Check if the file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")
    
    try:
        logger.info(f"Received food image: {file.filename}")
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
            contents = await file.read()
            temp.write(contents)
            temp_path = temp.name
        
        logger.info(f"Image saved to temporary file: {temp_path}")
        
        # Get macros from the image
        result = get_macros(food_name, temp_path)
        
        # Parse the JSON result
        try:
            # Find the JSON object within curly braces
            json_match = re.search(r'\{[\s\S]*\}', result)
            
            if json_match:
                json_str = json_match.group(0)
                logger.info(f"Extracted JSON string: {json_str[:50]}...")
                macros = json.loads(json_str)
                logger.info(f"Identified macros: {macros}")
            else:
                # If no JSON object is found, try to parse the entire response
                logger.warning(f"No JSON object found, trying to parse entire response: {result[:50]}...")
                macros = json.loads(result)
                logger.info(f"Identified macros: {macros}")
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON response: {result}")
            macros = {
                "calories": 0,
                "protein": 0,
                "fats": 0,
                "carbs": 0
            }
        
        # Remove the temporary file
        os.unlink(temp_path)
        
        return {
            "success": True,
            "macros": macros
        }
    except Exception as e:
        logger.error(f"Error processing food image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing food image: {str(e)}")

class SaveMacrosRequest(BaseModel):
    username: str
    meal_name: str
    food_name: str
    calories: float
    proteins: float
    fats: float
    carbs: float
    date_added: Optional[str] = None

@app.post("/save-macros")
async def save_macros(request: SaveMacrosRequest):
    """
    Save food macros to the database
    """
    try:
        username = request.username
        if not username:
            logger.error("Missing username in save macros request")
            raise HTTPException(status_code=400, detail="Username is required")
            
        logger.info(f"Saving macros for user {username}, meal {request.meal_name}, food {request.food_name}")
        
        # Add current date if not provided
        date_added = request.date_added if request.date_added else datetime.now().date().isoformat()
        logger.info(f"Using date: {date_added}")
        
        # Prepare payload with clean data
        payload = {
            "username": username,
            "meal_name": request.meal_name,
            "food_name": request.food_name,
            "calories": int(request.calories),
            "proteins": int(request.proteins),
            "fats": int(request.fats),
            "carbs": int(request.carbs),
            "date_added": date_added
        }
        
        logger.info(f"Payload: {payload}")
        
        # Insert into Supabase
        response = requests.post(
            f"{os.environ.get('SUPABASE_URL', 'https://givxrvslixpozwbhlslc.supabase.co')}/rest/v1/saved_macros",
            headers={
                "apikey": os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdnhydnNsaXhwb3p3Ymhsc2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjc1MzEsImV4cCI6MjA1ODkwMzUzMX0.C3-ZxMOAyYAI9BO5IHCX_rG2JkyDgMj9byms-hn12QM'),
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            json=payload
        )
        
        if response.status_code >= 400:
            error_text = response.text
            logger.error(f"Error saving macros: {response.status_code} - {error_text}")
            raise HTTPException(status_code=response.status_code, detail=f"Database error: {error_text}")
        
        logger.info(f"Successfully saved macros for user {username}")
        return {
            "success": True,
            "message": "Macros saved successfully"
        }
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error saving macros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving macros: {str(e)}")

@app.get("/get-user-macros/{username}")
async def get_user_macros(username: str, date: Optional[str] = None):
    """
    Get saved macros for a user, optionally filtered by date
    """
    try:
        logger.info(f"Fetching macros for user {username}")
        
        # Build query
        url = f"{os.environ.get('SUPABASE_URL', 'https://givxrvslixpozwbhlslc.supabase.co')}/rest/v1/saved_macros"
        params = {"username": f"eq.{username}", "order": "date_added.desc,meal_name.asc"}
        
        # Add date filter if provided
        if date:
            params["date_added"] = f"eq.{date}"
        
        # Make request
        response = requests.get(
            url,
            headers={
                "apikey": os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdnhydnNsaXhwb3p3Ymhsc2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjc1MzEsImV4cCI6MjA1ODkwMzUzMX0.C3-ZxMOAyYAI9BO5IHCX_rG2JkyDgMj9byms-hn12QM'),
                "Content-Type": "application/json"
            },
            params=params
        )
        
        if response.status_code >= 400:
            logger.error(f"Error fetching macros: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"Database error: {response.text}")
        
        # Parse response
        macros = response.json()
        
        return {
            "success": True,
            "macros": macros
        }
    except Exception as e:
        logger.error(f"Error fetching macros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching macros: {str(e)}")

@app.get("/get-user-weekly-macros/{username}")
async def get_user_weekly_macros(username: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Get saved macros for a user for a specific date range (default: past week)
    """
    try:
        logger.info(f"Fetching weekly macros for user {username}")
        
        # Calculate date range if not provided
        today = datetime.now().date()
        if not start_date:
            end_date_obj = today
            start_date_obj = end_date_obj - timedelta(days=6)
        else:
            try:
                # Parse provided dates
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
                end_date_obj = datetime.strptime(end_date or start_date, "%Y-%m-%d").date() if end_date else (start_date_obj + timedelta(days=6))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        start_date_str = start_date_obj.isoformat()
        end_date_str = end_date_obj.isoformat()
        
        logger.info(f"Date range: {start_date_str} to {end_date_str}")
        
        # Build query with explicit date range
        url = f"{os.environ.get('SUPABASE_URL', 'https://givxrvslixpozwbhlslc.supabase.co')}/rest/v1/saved_macros"
        
        # We need to fetch records where both conditions are met:
        # 1. username matches
        # 2. date is within range
        
        # Define query parameters
        # Use separate queries for start and end date
        params = {
            "username": f"eq.{username}",
            "order": "date_added.asc,meal_name.asc"
        }
        
        # For the date range, we'll fetch all records for the user and filter manually
        headers = {
            "apikey": os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdnhydnNsaXhwb3p3Ymhsc2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjc1MzEsImV4cCI6MjA1ODkwMzUzMX0.C3-ZxMOAyYAI9BO5IHCX_rG2JkyDgMj9byms-hn12QM'),
            "Content-Type": "application/json"
        }
        
        logger.info(f"Query params: {params}")
        
        # Make request
        response = requests.get(
            url,
            headers=headers,
            params=params
        )
        
        # Handle response
        if response.status_code >= 400:
            logger.error(f"Error fetching weekly macros: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"Database error: {response.text}")
        
        # Parse response and filter by date manually
        all_macros = response.json()
        logger.info(f"Retrieved {len(all_macros)} total entries")
        
        # Filter by date range
        macros = [
            entry for entry in all_macros 
            if entry["date_added"] >= start_date_str and entry["date_added"] <= end_date_str
        ]
        
        logger.info(f"Filtered to {len(macros)} entries within date range {start_date_str} to {end_date_str}")
        
        # Calculate summary by day
        daily_summary = {}
        for entry in macros:
            date = entry["date_added"]
            if date not in daily_summary:
                daily_summary[date] = {
                    "calories": 0,
                    "proteins": 0,
                    "carbs": 0,
                    "fats": 0,
                    "meals": []
                }
            
            # Add to daily totals
            daily_summary[date]["calories"] += entry["calories"]
            daily_summary[date]["proteins"] += entry["proteins"] 
            daily_summary[date]["carbs"] += entry["carbs"]
            daily_summary[date]["fats"] += entry["fats"]
            daily_summary[date]["meals"].append(entry)
        
        # Calculate weekly totals
        weekly_totals = {
            "calories": sum(day["calories"] for day in daily_summary.values()),
            "proteins": sum(day["proteins"] for day in daily_summary.values()),
            "carbs": sum(day["carbs"] for day in daily_summary.values()),
            "fats": sum(day["fats"] for day in daily_summary.values()),
        }
        
        # Calculate daily averages
        days_with_data = len(daily_summary)
        daily_averages = {
            "calories": weekly_totals["calories"] / max(days_with_data, 1),
            "proteins": weekly_totals["proteins"] / max(days_with_data, 1),
            "carbs": weekly_totals["carbs"] / max(days_with_data, 1),
            "fats": weekly_totals["fats"] / max(days_with_data, 1)
        }
        
        return {
            "success": True,
            "daily_summary": daily_summary,
            "weekly_totals": weekly_totals,
            "daily_averages": daily_averages,
            "date_range": {
                "start_date": start_date_str,
                "end_date": end_date_str
            }
        }
    except Exception as e:
        logger.error(f"Error fetching weekly macros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching weekly macros: {str(e)}")

# Start the server if run directly
if __name__ == "__main__":
    try:
        import uvicorn
        
        # Check if required packages are installed
        try:
            import requests
        except ImportError:
            logger.error("The 'requests' package is not installed. Please run 'pip install requests'")
            sys.exit(1)
            
        logger.info("Starting FastAPI server on http://0.0.0.0:8000")
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        logger.error(f"Error starting FastAPI server: {str(e)}")
        sys.exit(1) 