import OpenAI from "openai";
import { customerAssistantPrompt, BOOKING_INTENT_PROMPT } from "../ai/prompts";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  // Placeholder keeps the SDK from throwing at import when the integration is
  // unconfigured; call sites guard on the env var before using the client.
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "not-configured"
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatbotContext {
  garageId: string;
  customerId?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    vin?: string;
  };
  conversationHistory: ChatMessage[];
}

export async function generateChatbotResponse(
  context: ChatbotContext,
  userMessage: string
): Promise<string> {
  const systemPrompt = customerAssistantPrompt({
    garageId: context.garageId,
    vehicle: context.vehicleInfo
      ? `${context.vehicleInfo.year} ${context.vehicleInfo.make} ${context.vehicleInfo.model}`
      : undefined,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...context.conversationHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: messages,
    });

    const assistantMessage = response.choices[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    return assistantMessage;
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    throw new Error("Failed to generate chatbot response");
  }
}

export async function extractBookingIntent(message: string): Promise<{
  isBookingRequest: boolean;
  serviceType?: string;
  preferredDate?: string;
  urgency?: "low" | "medium" | "high";
}> {
  const prompt = `Analyze this customer message and determine if they want to book a service appointment.

Customer message: "${message}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: BOOKING_INTENT_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { isBookingRequest: false };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error extracting booking intent:", error);
    return { isBookingRequest: false };
  }
}

export async function diagnoseProblem(symptoms: string, vehicleInfo?: {
  make: string;
  model: string;
  year: number;
  mileage?: number;
}): Promise<{
  possibleIssues: string[];
  recommendations: string[];
  urgency: "low" | "medium" | "high" | "critical";
  estimatedCost?: string;
}> {
  const prompt = `As an automotive diagnostic expert, analyze these vehicle symptoms and provide diagnosis.

${vehicleInfo ? `Vehicle: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.mileage ? `, Mileage: ${vehicleInfo.mileage}` : ""}` : ""}
Symptoms: ${symptoms}

Provide a JSON response:
{
  "possibleIssues": ["issue 1", "issue 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "urgency": "low" | "medium" | "high" | "critical",
  "estimatedCost": "cost range or estimate"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No diagnostic response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error diagnosing problem:", error);
    throw new Error("Failed to diagnose problem");
  }
}
