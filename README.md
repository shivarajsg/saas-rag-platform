<div align="center">

# AI Chef Mate

### Intelligent Meal Planning & Nutrition Tracking with Agentic RAG

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC244C?style=for-the-badge)](https://qdrant.tech/)

<br />

**AI Chef Mate** is an AI-powered platform that creates personalized meal plans, analyzes food nutrition, tracks daily macros, and answers nutrition questions through an intelligent Agentic RAG workflow.

[Features](#key-features) · [Architecture](#architecture) · [Setup](#quick-start) · [Configuration](#environment-variables) · [API](#api-reference)

</div>

---

> [!IMPORTANT]
> Never commit `.env` files, API keys, Supabase service-role keys, or Qdrant credentials. Keep secrets local and add `.env` files to `.gitignore`.

## Overview

AI Chef Mate helps users plan meals around their available ingredients, dietary requirements, allergies, and protein targets. It combines a Next.js web application with a FastAPI AI service, Supabase authentication and data storage, Qdrant recipe retrieval, and language/vision models for conversational planning and food-image analysis.

| Capability | What It Enables |
|:--|:--|
| Smart Meal Planning | Personalized weekly recipes based on ingredients, preferences, allergies, and nutrition targets |
| Agentic RAG | Context-aware recipe retrieval and agent-assisted meal-plan generation |
| Food Recognition | Image-based food analysis for nutrition tracking |
| Macro Tracking | Daily and weekly summaries for calories, protein, fats, and carbohydrates |
| AI Chat | Meal-plan revisions, recipe questions, nutrition guidance, and follow-up conversations |
| Persistent Data | Secure accounts, saved meal plans, and saved nutrition records |

## Key Features

| Area | Features |
|:--|:--|
| Meal Planning | Ingredient-based recommendations, dietary preferences, allergy exclusions, protein goals, seven-day meal preparation, recipe quantities, and macro breakdowns |
| Nutrition Tracking | Food-image analysis, manual macro editing, daily nutrition history, weekly summaries, and meals-eaten records |
| AI Assistant | Context-aware conversations, meal-plan refinement, recipe adjustments, nutrition questions, and saved plans |
| Account Management | Sign-up, sign-in, password-reset workflow, and persistent meal/nutrition data |
| Retrieval System | Recipe discovery through semantic vector search in Qdrant |
| AI Vision | Food-image understanding for nutrition analysis |
| Data Layer | Supabase authentication and PostgreSQL-backed application data |

## Technology Stack

| Layer | Technologies |
|:--|:--|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI |
| Forms & Notifications | React Hook Form, Sonner, Lucide Icons |
| Backend | FastAPI, Python 3.12 |
| Authentication & Database | Supabase, PostgreSQL |
| AI Orchestration | CrewAI |
| Language Models | Meta Llama 3.3 70B through SambaNova |
| Vision Model | Meta Llama 3.2 11B Vision through SambaNova |
| Vector Database | Qdrant |
| Embeddings | all-MiniLM-L6-v2 and Cohere Embed English v3.0 |
| Development | Node.js, npm or yarn, Python virtual environments, Git |

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                      │
│  Dashboard · Meal Planner · Nutrition Tracker · AI Chat      │
│  TypeScript · Tailwind CSS · Shadcn UI · React Hook Form     │
└───────────────────────────┬──────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
┌─────────────▼─────────────┐   ┌─────────▼───────────────────┐
│         Supabase          │   │       FastAPI Backend        │
│ Auth · PostgreSQL · Data  │   │ AI Requests · Image Analysis │
└───────────────────────────┘   │ Chat Context · Macro Logic   │
                                └─────────────┬────────────────┘
                                              │
                 ┌────────────────────────────┼────────────────────────────┐
                 │                            │                            │
     ┌───────────▼───────────┐    ┌───────────▼───────────┐    ┌───────────▼───────────┐
     │ Agentic RAG / CrewAI  │    │ Qdrant Vector Search  │    │ Language & Vision AI  │
     │ Agents · Memory · Flow│    │ Recipe Retrieval      │    │ SambaNova Inference   │
     └───────────────────────┘    └───────────────────────┘    └───────────────────────┘
```

## Quick Start

### Prerequisites

| Tool / Account | Requirement |
|:--|:--|
| Node.js | Version 18 or later |
| npm or yarn | Package manager for the frontend |
| Python | Version 3.9 or later |
| Git | Clone and manage the repository |
| Supabase | Authentication and PostgreSQL database |
| Qdrant | Recipe vector database |
| SambaNova | API access for language and vision model inference |
| Cohere | API access for embedding-based agent memory |

### Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### Install frontend dependencies

```bash
npm install
```

### Install backend dependencies

```bash
cd api
python -m venv venv
```

**Windows PowerShell:**

```powershell
venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

Install Python packages:

```bash
pip install -r requirements.txt
cd ..
```

### Start development servers

```bash
npm run dev:all
```

| Service | Local Address |
|:--|:--|
| Next.js frontend | `http://localhost:3000` |
| FastAPI backend | `http://localhost:8000` |

## Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
API_URL=http://localhost:8000
```

Create another `.env` file inside the `api/` folder:

```env
SAMBANOVA_API_KEY=your_sambanova_api_key
COHERE_API_KEY=your_cohere_api_key
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_api_key
```

> [!WARNING]
> `SUPABASE_SERVICE_ROLE_KEY` has elevated permissions. Do not expose it in frontend code, browser variables, commits, logs, or screenshots.

## Supabase Setup

1. Create a Supabase project.
2. Open **Settings → Data API**.
3. Copy the project URL, anon key, and service-role key into the appropriate local environment file.
4. In the **Table Editor**, create the application tables below.

| Table | Columns |
|:--|:--|
| `saved_mps` | `username`, `mp_name`, `mp` as text; `created_at` as date |
| `saved_macros` | `username`, `meal_name`, `food_name` as text; `calories`, `proteins`, `fats`, `carbs` as int8; `date_added` as date |

## Qdrant Setup

<details>
<summary><strong>Prepare the recipe retrieval database</strong></summary>

1. Download the RecipeNLG dataset from the official dataset download page.
2. Accept the dataset terms and download the archive.
3. Extract the archive and locate `full_dataset.csv`.
4. Open `misc/dataset_preprocessing.ipynb` and run its cells to prepare the recipe data.
5. Open `misc/upload_2_qdrant.ipynb` and run its cells to upload the prepared recipe records to Qdrant.
6. Add your Qdrant cluster URL and API key to `api/.env`.

</details>

## Usage Guide

### Create an account

1. Open the application home page.
2. Select **Get Started**.
3. Register with an email address and password.
4. Sign in to access the dashboard.
5. Use the password-recovery workflow if you cannot access your account.

### Create a meal plan

1. Open the **Create Meal Plan** page.
2. Upload an ingredient image or enter ingredients manually.
3. Choose dietary preferences and add allergy restrictions.
4. Set your daily protein target.
5. Generate a tailored meal plan.
6. Review recipe steps, ingredient quantities, and nutrition information.
7. Use AI chat to refine meals, change recipes, or ask nutrition questions.
8. Save the final plan for later use.

### Track nutrition

1. Open the **Nutrition Tracker**.
2. Upload a meal image or enter food information manually.
3. Review or edit the identified macro values.
4. Save the meal data.
5. Review daily and weekly calories, protein, fats, and carbohydrates.

### Manage saved meal plans

1. Open **View Saved Meal Plans**.
2. Select a saved plan to view it.
3. Rename a plan using the edit control.
4. Delete a plan when it is no longer needed.

## API Reference

### FastAPI endpoints

| Endpoint | Purpose |
|:--|:--|
| `/chat` | Processes conversational meal-planning requests |
| `/analyze-food-macros` | Analyzes food images and returns nutritional information |
| `/save-macros` | Saves nutrition tracking data |
| `/get-user-macros/{username}` | Retrieves a user’s nutrition data |
| `/get-user-weekly-macros/{username}` | Retrieves weekly nutrition summaries |

### Next.js API routes

| Route | Purpose |
|:--|:--|
| `/api/chat` | Proxy route for the FastAPI chat service |
| `/api/analyze-food-macros` | Proxy route for food-image analysis |
| `/api/save-meal-plan` | Saves meal plans in Supabase |
| `/api/save-macros` | Proxies macro-saving requests |

## Agentic RAG Evaluation

Use the notebook below to compare traditional RAG and Agentic RAG behavior:

```text
misc/rag_test.ipynb
```

Run the notebook cells in order and follow the embedded guidance to evaluate retrieval and agent behavior.

## Development Checklist

- [ ] Configure Supabase project credentials
- [ ] Create required Supabase tables
- [ ] Configure SambaNova API key
- [ ] Configure Cohere API key
- [ ] Configure Qdrant cluster credentials
- [ ] Prepare and upload recipe data to Qdrant
- [ ] Install frontend dependencies
- [ ] Create and activate the Python virtual environment
- [ ] Install backend dependencies
- [ ] Start frontend and backend development servers

## Security Practices

- Keep root `.env` and `api/.env` files in `.gitignore`.
- Never expose API keys, service-role keys, database credentials, or tokens.
- Use separate local, testing, and production credentials.
- Rotate a credential immediately if it is accidentally committed.
- Review Supabase row-level security policies before deploying publicly.
- Restrict backend-only secrets to the FastAPI service.

---

<div align="center">

Built for practical, personalized meal planning through AI, retrieval, and nutrition-aware workflows.

</div>
