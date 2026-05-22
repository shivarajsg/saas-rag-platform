"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, Loader2, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import KeyMarkdown from '@/components/utils/key-markdown';
import { getSavedMealPlanCount } from '@/lib/meal-plan';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
};

type ChatInterfaceProps = {
  initialMessage?: string;
  ingredients?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  proteinTarget?: number;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialMessage,
  ingredients = [],
  dietaryRestrictions = [],
  allergies = [],
  proteinTarget,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingMealPlan, setSavingMealPlan] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Generate a unique user ID on first load
  useEffect(() => {
    // If we don't have a user ID in local storage, generate one
    if (!localStorage.getItem('mealplan_user_id')) {
      localStorage.setItem('mealplan_user_id', uuidv4());
    }
  }, []);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage) {
      // Only send if messages array is empty - this prevents any duplicates
      if (messages.length === 0) {
        handleInitialMessage();
      }
    }
  }, [initialMessage, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update handleInitialMessage to use request user ID
  const handleInitialMessage = async () => {
    // Setting loading state to show spinner
    setLoading(true);
    
    try {
      // Get the user ID from localStorage
      const userId = localStorage.getItem('mealplan_user_id') || uuidv4();
      
      // Create and add user's initial message first
      const userMessage: Message = {
        id: uuidv4(),
        content: `
Ingredients: ${ingredients.length > 0 ? ingredients.join(', ') : 'None provided'}  

Dietary Restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'None'}

Allergy Information: ${allergies.length > 0 ? allergies.join(', ') : 'None'}

Daily Protein Target: ${proteinTarget || 'Not specified'} grams`,
        role: 'user',
        timestamp: new Date().toISOString(),
      };
      
      // Add the user message to the chat immediately
      setMessages([userMessage]);

      // Now fetch the AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: initialMessage || "I'd like a meal plan",
          user_id: userId,
          ingredients: ingredients,
          dietaryRestrictions: dietaryRestrictions,
          allergies: allergies,
          proteinTarget: proteinTarget,
          is_initial_message: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      // Add assistant's response
      const assistantMessage: Message = {
        id: uuidv4(),
        content: data.message,
        role: 'assistant',
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      // Update messages with assistant's response
      setMessages(prevMessages => {
        // Only add if it's not a duplicate
        if (prevMessages.length === 1 && prevMessages[0].role === 'user') {
          return [...prevMessages, assistantMessage];
        }
        return prevMessages;
      });
    } catch (error) {
      console.error('Error sending initial message:', error);
      // Add an error message
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          content: "I'm sorry, there was an error generating your meal plan. Please try again.",
          role: 'assistant',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Update handleSend to use request user ID
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Get the user ID from localStorage
      const userId = localStorage.getItem('mealplan_user_id') || uuidv4();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          user_id: userId,
          is_initial_message: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      // Add assistant's response
      const assistantMessage: Message = {
        id: uuidv4(),
        content: data.message,
        role: 'assistant',
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: "I'm sorry, there was an error processing your message. Please try again.",
          role: 'assistant',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Update handleSaveMealPlan to use request user ID
  const handleSaveMealPlan = async () => {
    if (messages.length === 0) {
      toast.error("Please generate a meal plan first before saving.");
      return;
    }
    
    // Add a "Save the latest version of my meal plan" message
    const saveRequestMessage: Message = {
      id: uuidv4(),
      content: "Save the latest version of my meal plan.",
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Add the save request message to the chat
    setMessages(prev => [...prev, saveRequestMessage]);
    
    // Send this message to get the meal plan from the API
    setSavingMealPlan(true);
    setLoading(true);
    toast.loading("Saving your meal plan...");
    
    try {
      // Get the user ID from localStorage
      const userId = localStorage.getItem('mealplan_user_id') || uuidv4();
      
      // First, get the meal plan by sending the save request to the chat API
      const saveResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Save the latest version of my meal plan.",
          user_id: userId,
          is_initial_message: false
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to retrieve meal plan');
      }

      const saveData = await saveResponse.json();
      
      // Use this response as the meal plan content but don't display it in the chat
      const mealPlanContent = saveData.message;
      
      if (!mealPlanContent || mealPlanContent.length < 10) {
        throw new Error("Retrieved meal plan content is too short or empty.");
      }
      
      // Get count of existing meal plans for sequential numbering
      const existingPlans = await getSavedMealPlanCount(userId);
      const planNumber = existingPlans + 1;
      const planName = `Meal Plan #${planNumber}`;
      
      // Log more details for debugging
      console.log("Starting save meal plan operation:", {
        userId: userId,
        contentLength: mealPlanContent.length,
        planName: planName,
        existingPlans: existingPlans
      });
      
      // Save the meal plan to the database
      console.log("Sending fetch request to /api/save-meal-plan");
      const dbSaveResponse = await fetch('/api/save-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealPlanContent: mealPlanContent,
          userId: userId,
          planName: planName
        }),
      });

      // Read the response text first
      console.log("Received response with status:", dbSaveResponse.status);
      const responseText = await dbSaveResponse.text();
      console.log("Response text length:", responseText.length);
      
      let responseData;
      try {
        // Then try to parse it as JSON
        responseData = JSON.parse(responseText);
        console.log("Successfully parsed response JSON");
      } catch (parseError) {
        console.error("Error parsing response as JSON:", parseError);
        console.error("Raw response text:", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        throw new Error("Invalid response format from server");
      }
      
      if (!dbSaveResponse.ok) {
        console.error("Server returned error response:", responseData);
        let errorMsg = "Failed to save meal plan";
        
        if (responseData.error) {
          errorMsg += ": " + responseData.error;
        }
        
        if (responseData.details) {
          console.error("Error details:", responseData.details);
        }
        
        throw new Error(errorMsg);
      }
      
      // Success case
      console.log("Successfully saved meal plan:", responseData.mealPlan ? "Has meal plan data" : "No meal plan data");
      toast.dismiss();
      toast.success("Your meal plan has been saved successfully!");
      
      // Add confirmation message from assistant
      const confirmationMessage: Message = {
        id: uuidv4(),
        content: `Meal plan has been saved as "${planName}"`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save meal plan: ${errorMessage}`);
      
      // Add error message from assistant
      const errorResponseMessage: Message = {
        id: uuidv4(),
        content: `Failed to save meal plan: ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setSavingMealPlan(false);
      setLoading(false);
    }
  };

  // Helper function to extract a name from meal plan content
  const extractPlanName = (content: string): string => {
    // Look for a title in the content (assumes markdown format)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    // Look for "Meal Plan for..." text
    const mealPlanForMatch = content.match(/Meal Plan for\s+(.+?)(\n|\.)/i);
    if (mealPlanForMatch && mealPlanForMatch[1]) {
      return `Meal Plan for ${mealPlanForMatch[1].trim()}`;
    }
    
    // Default name with timestamp
    return `Meal Plan ${new Date().toLocaleDateString()}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-gray-800/80 text-white rounded-lg shadow-md border border-gray-700 overflow-hidden relative before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-r before:from-blue-600 before:to-emerald-600 before:-z-10 before:pointer-events-none">
      <div className="p-4 bg-gray-800 text-white rounded-t-lg flex justify-between items-center border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold">Meal Plan Assistant</h2>
          <p className="text-sm text-gray-300">Ask any questions about your meal plan or food in general</p>
        </div>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
          onClick={handleSaveMealPlan}
          disabled={savingMealPlan || loading || messages.length === 0}
        >
          {savingMealPlan ? "Saving..." : "Save Meal Plan"}
        </Button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Your personalized meal plan will appear here</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-br-none'
                      : 'bg-gray-700 text-white rounded-bl-none'
                  }`}
                >
                  <div className="mb-1 flex items-center">
                    <span
                      className="mr-2 text-lg"
                      aria-label={message.role === 'user' ? 'User' : 'Assistant'}
                    >
                      {message.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-left text-white">
                    <div className="prose prose-invert max-w-none break-words">
                      <KeyMarkdown content={message.content} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-700 p-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">🤖</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white resize-none"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-3 rounded-lg h-full disabled:opacity-50 flex-shrink-0"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 