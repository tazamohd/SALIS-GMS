import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
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
  const systemPrompt = `You are an AI assistant for SALIS AUTO, a world-class automotive service center. Your role is to:

1. Answer customer questions about services, pricing, and vehicle maintenance
2. Help customers book service appointments
3. Provide basic vehicle diagnostics and recommendations
4. Offer personalized service suggestions based on vehicle information

Guidelines:
- Be professional, friendly, and helpful
- Provide accurate information about automotive services
- When booking appointments, collect: service type, preferred date/time, and customer contact info
- For diagnostics, ask about symptoms, unusual noises, warning lights, and vehicle behavior
- Always prioritize customer safety - recommend immediate service for critical issues
- If you don't know something, admit it and offer to connect them with a service advisor

Current Context:
- Garage ID: ${context.garageId}
${context.vehicleInfo ? `- Vehicle: ${context.vehicleInfo.year} ${context.vehicleInfo.make} ${context.vehicleInfo.model}` : ""}

Respond naturally and conversationally.`;

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

Customer message: "${message}"

Respond with JSON:
{
  "isBookingRequest": true/false,
  "serviceType": "oil change" | "brake service" | "diagnostic" | "general maintenance" | etc,
  "preferredDate": "extracted date if mentioned",
  "urgency": "low" | "medium" | "high"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
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
