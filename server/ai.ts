import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// The OpenAI SDK throws at construction when neither apiKey nor OPENAI_API_KEY
// is set. When the AI integration is not configured, every call site guards on
// AI_INTEGRATIONS_OPENAI_API_KEY and falls back before touching this client, so a
// placeholder keeps import-time safe (e.g. the test suite booting the full route
// tree) without changing runtime behavior when a real key is present.
export const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "not-configured"
});

export const AI_MODEL = "gpt-5";
export const AI_MAX_TOKENS = 8192;

interface JobEstimationInput {
  serviceType: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  historicalJobs?: Array<{
    serviceType: string;
    actualHours: number;
    actualCost: number;
  }>;
}

interface MaintenancePredictionInput {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  mileage: number;
  serviceHistory: Array<{
    date: string;
    serviceType: string;
    description: string;
  }>;
}

interface PartsRecommendationInput {
  serviceType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  description?: string;
}

interface ScheduleOptimizationInput {
  appointments: Array<{
    id: string;
    startTime: string;
    endTime: string;
    technicianId: string;
    estimatedDuration: number;
  }>;
  technicians: Array<{
    id: string;
    name: string;
    availability: any;
    skills: string[];
  }>;
}

export async function estimateJobTime(input: JobEstimationInput) {
  try {
    const prompt = `You are an expert automotive service estimator. Analyze the following job and provide a time and cost estimation.

Service Type: ${input.serviceType}
Vehicle: ${input.vehicleMake || 'Unknown'} ${input.vehicleModel || 'Unknown'} (${input.vehicleYear || 'Unknown'})

${input.historicalJobs && input.historicalJobs.length > 0 ? `Historical data for similar jobs:
${input.historicalJobs.map(job => `- ${job.serviceType}: ${job.actualHours} hours, $${job.actualCost}`).join('\n')}` : ''}

Provide your estimation in JSON format with the following structure:
{
  "estimatedHours": number,
  "estimatedCost": number,
  "confidence": number (0-100),
  "reasoning": "explanation of your estimation"
}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert automotive service estimator. Provide accurate time and cost estimates based on industry standards and historical data. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: AI_MAX_TOKENS
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return {
        estimatedHours: 0,
        estimatedCost: 0,
        confidence: 0,
        reasoning: "AI service unavailable",
        error: "No response from AI service"
      };
    }

    const result = JSON.parse(content);
    
    return {
      estimatedHours: result.estimatedHours || 0,
      estimatedCost: result.estimatedCost || 0,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || "No reasoning provided"
    };
  } catch (error: any) {
    console.error("AI estimation error:", error);
    return {
      estimatedHours: 0,
      estimatedCost: 0,
      confidence: 0,
      reasoning: "AI estimation failed",
      error: error.message || "Unknown error occurred"
    };
  }
}

export async function predictMaintenance(input: MaintenancePredictionInput) {
  try {
    const prompt = `You are an expert automotive diagnostician. Analyze the vehicle service history and predict potential maintenance needs.

Vehicle: ${input.vehicleMake} ${input.vehicleModel} (${input.vehicleYear})
Current Mileage: ${input.mileage}

Service History:
${input.serviceHistory.map(s => `- ${s.date}: ${s.serviceType} - ${s.description}`).join('\n')}

Identify potential upcoming maintenance needs or issues. Provide your analysis in JSON format:
{
  "predictions": [
    {
      "issue": "description of potential issue",
      "severity": "low|medium|high|critical",
      "recommendedAction": "what should be done",
      "estimatedTimeframe": "when this should be addressed",
      "confidence": number (0-100)
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert automotive diagnostician specializing in predictive maintenance. Analyze service history to identify potential future issues. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: AI_MAX_TOKENS
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return {
        predictions: [],
        error: "No response from AI service"
      };
    }

    const result = JSON.parse(content);
    
    return {
      predictions: Array.isArray(result.predictions) ? result.predictions : []
    };
  } catch (error: any) {
    console.error("AI maintenance prediction error:", error);
    return {
      predictions: [],
      error: error.message || "Unknown error occurred"
    };
  }
}

export async function recommendParts(input: PartsRecommendationInput) {
  try {
    const prompt = `You are an expert automotive parts specialist. Recommend the necessary parts for the following service.

Service Type: ${input.serviceType}
Vehicle: ${input.vehicleMake} ${input.vehicleModel} (${input.vehicleYear})
${input.description ? `Additional Details: ${input.description}` : ''}

Provide parts recommendations in JSON format:
{
  "parts": [
    {
      "name": "part name",
      "partNumber": "manufacturer part number if known",
      "quantity": number,
      "estimatedCost": number,
      "priority": "required|recommended|optional"
    }
  ],
  "totalEstimatedCost": number,
  "reasoning": "explanation of recommendations",
  "confidence": number (0-100)
}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert automotive parts specialist. Recommend appropriate parts based on the service type and vehicle details. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: AI_MAX_TOKENS
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return {
        parts: [],
        totalEstimatedCost: 0,
        reasoning: "AI service unavailable",
        confidence: 0,
        error: "No response from AI service"
      };
    }

    const result = JSON.parse(content);
    
    return {
      parts: Array.isArray(result.parts) ? result.parts : [],
      totalEstimatedCost: result.totalEstimatedCost || 0,
      reasoning: result.reasoning || "No reasoning provided",
      confidence: result.confidence || 0
    };
  } catch (error: any) {
    console.error("AI parts recommendation error:", error);
    return {
      parts: [],
      totalEstimatedCost: 0,
      reasoning: "AI recommendation failed",
      confidence: 0,
      error: error.message || "Unknown error occurred"
    };
  }
}

export async function optimizeSchedule(input: ScheduleOptimizationInput) {
  try {
    const prompt = `You are an expert in automotive service scheduling optimization. Analyze the current schedule and provide optimization suggestions.

Current Appointments:
${input.appointments.map(apt => `- ${apt.startTime} to ${apt.endTime}: Technician ${apt.technicianId}, Duration: ${apt.estimatedDuration} min`).join('\n')}

Available Technicians:
${input.technicians.map(tech => `- ${tech.name} (Skills: ${tech.skills.join(', ')})`).join('\n')}

Identify scheduling conflicts, inefficiencies, and provide optimization suggestions in JSON format:
{
  "conflicts": [
    {
      "appointmentId": "id",
      "issue": "description of conflict",
      "severity": "low|medium|high"
    }
  ],
  "suggestions": [
    {
      "type": "reschedule|reassign|combine",
      "appointmentId": "id",
      "suggestion": "what to do",
      "potentialTimeSaved": number (in minutes)
    }
  ],
  "totalPotentialTimeSaved": number,
  "reasoning": "overall optimization strategy"
}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert in automotive service scheduling optimization. Analyze schedules to minimize conflicts and maximize efficiency. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: AI_MAX_TOKENS
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return {
        conflicts: [],
        suggestions: [],
        totalPotentialTimeSaved: 0,
        reasoning: "AI service unavailable",
        error: "No response from AI service"
      };
    }

    const result = JSON.parse(content);
    
    return {
      conflicts: Array.isArray(result.conflicts) ? result.conflicts : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      totalPotentialTimeSaved: result.totalPotentialTimeSaved || 0,
      reasoning: result.reasoning || "No reasoning provided"
    };
  } catch (error: any) {
    console.error("AI schedule optimization error:", error);
    return {
      conflicts: [],
      suggestions: [],
      totalPotentialTimeSaved: 0,
      reasoning: "AI optimization failed",
      error: error.message || "Unknown error occurred"
    };
  }
}

export async function chatWithCustomer(message: string, conversationHistory: Array<{ role: string; content: string }>, garageContext: any) {
  try {
    const systemPrompt = `You are a helpful customer support assistant for an automotive service garage. 

Garage Information:
- Name: ${garageContext.garageName}
- Services: ${garageContext.services?.join(', ') || 'General automotive repair and maintenance'}
- Working Hours: ${garageContext.workingHours || 'Contact us for hours'}

Your role is to:
1. Answer customer questions about services, pricing, and availability
2. Help customers schedule appointments
3. Provide general automotive advice
4. Escalate complex issues to human staff when necessary

If you cannot answer a question or if the customer needs immediate assistance, politely inform them and offer to connect them with a staff member.

Always be professional, friendly, and helpful.`;

    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      max_completion_tokens: AI_MAX_TOKENS
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return {
        response: "I apologize, but I'm experiencing technical difficulties. Please contact staff for assistance.",
        shouldHandoff: true,
        error: "No response from AI service"
      };
    }

    return {
      response: content,
      shouldHandoff: content.toLowerCase().includes('connect you with') || 
                     content.toLowerCase().includes('speak with a staff')
    };
  } catch (error: any) {
    console.error("AI customer chat error:", error);
    return {
      response: "I apologize, but I'm experiencing technical difficulties. Please contact staff for assistance.",
      shouldHandoff: true,
      error: error.message || "Unknown error occurred"
    };
  }
}
