# AI Chef Mate: A Meal Planning & Nutrition Tracking Application Powered By Agentic RAG

A cutting-edge AI-powered meal planning and nutrition tracking application built with Next.js, FastAPI, and advanced Agentic RAG capabilities to help users create personalized meal plans based on available ingredients, dietary preferences, and nutritional goals.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Acknowledgments](#acknowledgments)

## Overview

AI Chef Mate is a comprehensive meal planning application that leverages Agentic RAG to create personalized meal plans based on user's available ingredients, dietary preferences, and nutritional goals. The application includes features for meal planning, nutrition tracking, and ingredient recognition, providing users with a complete solution for managing their diet and meal preparation.

## Key Features

### Personalized Meal Planning

- **Ingredients-Based Meal Generation**: Upload a photo of your ingredients or add them manually
- **Dietary Preference Support**: Accommodates various dietary needs (vegan, vegetarian, keto, etc.)
- **Allergy Management**: Excludes ingredients based on user-specified allergies
- **Protein Goal Setting**: Creates meal plans that meet daily protein targets
- **Weekly Meal Prep**: Generates recipes with quantities for 7-day meal prep
- **Nutritional Information**: Calculates macros for each meal and weekly totals

### Nutrition Tracking

- **Food Image Analysis**: Upload photos of meals to automatically analyze nutritional content
- **Manual Configuration**: Manually edit any of the macros if necessary
- **Daily & Weekly Summaries**: View nutrition data by day or aggregated weekly
- **Meals Eaten**: View the meals you have eaten for the day

### AI Chat Interface

- **Meal Plan Refinement**: Chat with the AI to modify and customize meal plans
- **Nutrition Questions**: Ask questions about food, ingredients, and nutrition
- **Save & Review**: Save generated meal plans for future reference
- **Context-Aware Conversations**: The AI remembers previous interactions for better assistance

### User Management

- **User Authentication**: Secure sign-up and login functionality
- **Reset Password**: Enter your email to get an instant password reset link
- **Data Storage**: Your meals and plans are stored for future viewing

## Technology Stack

### Frontend

- **Next.js 15**: React framework with server-side rendering
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For utility-first styling
- **Shadcn UI**: Component library for a consistent UI
- **React Hook Form**: For form validation and handling
- **Sonner**: For toast notifications
- **Lucide Icons**: For a modern icon set

### Backend

- **FastAPI**: Python-based API server for handling AI operations
- **Supabase**: Online PostgreSQL database with authentication services
- **Python 3.12**: For backend processing and AI integration

### AI & ML

- **Meta Llama 3.3 70B**: Inferenced through **SambaNova Systems** for generating meal plans and nutritional guidance
- **Meta Llama 3.2 11B Vision**: Inferenced through **SambaNova Systems** to perform vision processing for food image analysis
- **CrewAI**: Framework for agent-based AI system
- **Qdrant**: Vector database for recipe search
- **Embedding Models**:
    - **All MiniLM L6 V2** provided by **Sentence Transformer** library for Qdrant
    - **Embed English v3.0** provided by **Cohere** for Crew AI memory

## Architecture

The application follows a client-server architecture:

1. **Next.js Frontend**:
   - Handles user interface and interactions
   - Communicates with both the FastAPI backend and Supabase
   - Provides real-time feedback and displays AI-generated content

2. **FastAPI Backend**:
   - Processes AI requests and manages LLM interactions
   - Handles image analysis for food recognition
   - Maintains conversation context and agent memory
   - Provides nutrition data analysis

3. **Supabase Database**:
   - Stores user accounts and authentication
   - Maintains saved meal plans and nutrition tracking data
   - Provides secure API access to user data

4. **AI Components**:
   - LLM integration for AI Agent powered meal plan generation
   - Vision models for food recognition and nutrition tracking
   - Vector search for finding relevant recipes

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- Git
- Supabase account
- Qdrant account
- API keys for [SambaNova](https://cloud.sambanova.ai/apis), and [Cohere](https://dashboard.cohere.com/api-keys)

### Supabase Setup

1. Once you create an account and a project, first go to the `Settings` and then the `Data API` tab. Here you'll be able to find your `Project URL`, `Anon Key` & `Service Role Key`. Copy these and paste them as explained below in the [Environment Variables](#environment-variables) section.
2. Then head to the `Table Editor` tab to create the tables to store the data.
3. Create a table called saved_mps with columns `username, mp_name, mp` as text data type and a column called `created_at` with data type as date. 
4. Create a table called saved_macros with columns `username, meal_name, food_name` as text data type, `calories, proteins, fats, carbs` as int8 data type and `date_added` as date data type.

### Qdrant Setup

1.  **Download the dataset**:
    - Go to the [download page](https://recipenlg.cs.put.poznan.pl/dataset).
    - Accept Terms and Conditions and download zip file.
    - Unpack the zip file and you'll get the `full_dataset.csv` file in the dataset directory. 
2.  **Preprocess the dataset**:
    - First run all the cells in the `dataset_preprocessing.ipynb` file found in the `misc` folder. This will allow you to get the preprocessed dataset and the dataset with 1,000,000 records.
3. **Upload the data to Qdrant**:
    - Next, run all the cells in the `upload_2_qdrant.ipynb` file located in the `misc` folder so that your vector database is ready.

### Environment Variables

Create `.env` files in both the root directory and the `api` directory with the following variables:

#### Root `.env` (for Next.js should be created in the root directory)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
API_URL=http://localhost:8000
```

#### API `.env` (for FastAPI should be created in the api folder)
```
SAMBANOVA_API_KEY=your_sambanova_api_key
COHERE_API_KEY=your_cohere_api_key
QDRANT_URL=your_cluster_url
QDRANT_API_KEY=your_qdrant_api_key
```

### Installation Steps

1. **Clone the repository**

Create a colder for the project
   ```bash
   cd <your folder name>
   git clone git@git.cs.bham.ac.uk:projects-2024-25/pxk232.git
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Python backend dependencies**
   ```bash
   cd api
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

4. **Start the development servers**
   ```bash
   npm run dev:all
   ```

The application will be available at `http://localhost:3000`, and the API server will run at `http://localhost:8000`.

## Usage Guide

### Account creation, Sign in, Forgot password

1. In the home page click the **Get Started** button to be redirected to the create acount page
2. Enter your email ID and password and create your account. After that you will be signed in and redirected to the dashboard.
3. If you already have an account, you can click on the sign in button to enter your details and login to your account
4. Incase you forgot your password, you can click on the forgot password button and you will be redirected to another page where you

### Creating a Meal Plan

1. In the dashboard, navigate to the **"Create Meal Plan"** page
2. Follow the step-by-step process:
   - Upload a photo of your ingredients or add them manually
   - Select dietary preferences and allergies
   - Set your daily protein target
   - Review and generate your meal plan
3. The AI will create a personalized weekly meal plan with:
   - Breakfast, lunch, dinner, and snack recipes
   - Ingredient quantities for 7 servings (batch cooking)
   - Nutritional information per serving
   - Preparation instructions
4. Use the chat interface to:
   - Ask questions about your meal plan
   - Request modifications to recipes
   - Get additional nutrition advice
5. Save your customized meal plan for future reference

### Tracking Nutrition

1. Navigate to the **"Nutrition Tracker"** page
2. Add meals by:
   - Uploading a photo of your food
   - Entering food details manually
3. View your daily and weekly nutrition summaries
4. Track progress over time with the weekly view

### View your saved meal plans

1. Navigate to the **"View Saved Meal Plans"** page
2. Here you'll be able to see all your saved meal plans
3. Click on the **"View Plan"** button to view a meal plan
4. Click on the pencil icon to change the name of a meal plan and hit the save button when done
5. Click the trash bin icon to delete a meal plan. You will be asked to confirm before deleting.

### Agentic RAG vs RAG

To test the two different RAG methods you can use the `rag_test.ipynb` file located in the `misc` folder. Run all the cells and follow the guide given in the comments.

## API Documentation

### FastAPI Endpoints

- `/chat`: Processes chatbot conversations for meal planning
- `/analyze-food-macros`: Analyzes food images to extract nutritional information
- `/save-macros`: Saves meal nutrition data to the database
- `/get-user-macros/{username}`: Retrieves a user's daily nutrition data
- `/get-user-weekly-macros/{username}`: Gets weekly nutrition summaries

### Next.js API Routes

- `/api/chat`: Proxy for the FastAPI chat endpoint
- `/api/analyze-food-macros`: Proxy for food analysis
- `/api/save-meal-plan`: Stores meal plans in Supabase
- `/api/save-macros`: Proxy for saving nutrition data

## License

This project is licensed under a custom license. You may use the code for personal, non-commercial purposes only (e.g., running the app locally). Commercial use and redistribution are strictly prohibited. See the [LICENSE](./LICENSE) file for more details.

## Acknowledgments

This repository contains the code for the Final Year Project of Pranav Krishnakumar, a BSc Computer Science student at the University of Birmingham Dubai. A huge thank you to Professor Safdar Khan and Professor Syed Fawad Hussain for their support and guidance through the making of this project.