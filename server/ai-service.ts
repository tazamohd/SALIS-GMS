// AI Service for SALIS AUTO - Phase 1: AI & Automation
// Using Replit AI Integrations for OpenAI access (no API key needed, billed to credits)

import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// AI Chatbot - Module 85
export async function* streamChatResponse(messages: any[]) {
  const stream = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are an expert automotive service assistant for SALIS AUTO, a professional garage management system. 
        You help with:
        - Vehicle diagnostics and troubleshooting
        - Service recommendations and maintenance schedules
        - Parts identification and compatibility
        - Repair procedures and best practices
        - Customer service inquiries
        
        Provide clear, professional, and helpful responses. If you're unsure about something, acknowledge it honestly.`
      },
      ...messages
    ],
    stream: true,
    max_completion_tokens: 8192
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Predictive Maintenance AI - Module 86
export async function analyzePredictiveMaintenance(vehicleData: {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  serviceHistory: any[];
}) {
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are an automotive maintenance prediction AI. Analyze vehicle data and predict upcoming maintenance needs.
        Return predictions in JSON format with: { predictions: [{ issue, probability, estimatedMiles, severity, recommendation }] }`
      },
      {
        role: "user",
        content: `Analyze this vehicle:
        - ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}
        - Current mileage: ${vehicleData.mileage}
        - Service history: ${JSON.stringify(vehicleData.serviceHistory)}
        
        Predict upcoming maintenance needs.`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192
  });

  const result = JSON.parse(completion.choices[0].message.content || '{"predictions": []}');
  return result.predictions;
}

// Smart Parts Recommendations - Module 87
export async function generatePartsRecommendations(context: {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  serviceType: string;
  symptoms?: string;
}) {
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a parts recommendation AI for automotive repair. 
        Return recommendations in JSON format: { recommendations: [{ partName, partNumber, compatibility, priority, estimatedCost, reason }] }`
      },
      {
        role: "user",
        content: `Vehicle: ${context.year} ${context.make} ${context.model}
        Service: ${context.serviceType}
        ${context.symptoms ? `Symptoms: ${context.symptoms}` : ''}
        
        Recommend necessary parts with compatibility scores (0-100).`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192
  });

  const result = JSON.parse(completion.choices[0].message.content || '{"recommendations": []}');
  return result.recommendations;
}

// Document OCR Analysis - Module 88
export async function analyzeOCRDocument(extractedText: string, documentType: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a document analysis AI. Parse automotive documents and extract structured data.
        Return data in JSON format: { type, fields: { ... }, summary }`
      },
      {
        role: "user",
        content: `Document Type: ${documentType}
        Extracted Text: ${extractedText}
        
        Extract and structure all relevant information (invoice numbers, amounts, dates, parts, services, etc.).`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192
  });

  const result = JSON.parse(completion.choices[0].message.content || '{"type": "unknown", "fields": {}}');
  return result;
}

// AI Service Suggestions - Module 89
export async function generateServiceSuggestions(context: {
  customer: string;
  vehicle: string;
  symptoms: string;
  mileage: number;
}) {
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are an automotive service advisor AI. Based on symptoms and vehicle data, suggest services.
        Return suggestions in JSON format: { suggestions: [{ service, reason, priority, estimatedCost, estimatedTime }] }`
      },
      {
        role: "user",
        content: `Vehicle: ${context.vehicle}
        Mileage: ${context.mileage}
        Customer reports: ${context.symptoms}
        
        What services do you recommend?`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192
  });

  const result = JSON.parse(completion.choices[0].message.content || '{"suggestions": []}');
  return result.suggestions;
}
