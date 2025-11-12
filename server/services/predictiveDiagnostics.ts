import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export interface VehicleDiagnosticInput {
  vehicleId: string;
  mileage: number;
  engineTemperature?: number;
  oilPressure?: number;
  brakePadWear?: number;
  batteryVoltage?: number;
  tireCondition?: string;
  lastServiceDate?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  fuelLevel?: number;
  checkEngineLightOn?: boolean;
  unusualNoises?: string;
  additionalSymptoms?: string;
}

export interface DiagnosticPrediction {
  predictedIssue: string;
  severity: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  estimatedTimeframe: string;
  confidence: number;
  riskLevel: string;
  additionalDetails?: string;
}

export async function generatePredictiveDiagnostic(
  input: VehicleDiagnosticInput
): Promise<DiagnosticPrediction> {
  const prompt = `You are an expert automotive diagnostic AI. Analyze the following vehicle data and predict potential failures or maintenance needs.

Vehicle Information:
- Make: ${input.vehicleMake || "Unknown"}
- Model: ${input.vehicleModel || "Unknown"}
- Year: ${input.vehicleYear || "Unknown"}
- Mileage: ${input.mileage} miles
${input.engineTemperature ? `- Engine Temperature: ${input.engineTemperature}°F` : ""}
${input.oilPressure ? `- Oil Pressure: ${input.oilPressure} PSI` : ""}
${input.brakePadWear ? `- Brake Pad Wear: ${input.brakePadWear}%` : ""}
${input.batteryVoltage ? `- Battery Voltage: ${input.batteryVoltage}V` : ""}
${input.tireCondition ? `- Tire Condition: ${input.tireCondition}` : ""}
${input.lastServiceDate ? `- Last Service: ${input.lastServiceDate}` : ""}
${input.fuelLevel !== undefined ? `- Fuel Level: ${input.fuelLevel}%` : ""}
${input.checkEngineLightOn ? `- Check Engine Light: ON` : ""}
${input.unusualNoises ? `- Unusual Noises: ${input.unusualNoises}` : ""}
${input.additionalSymptoms ? `- Additional Symptoms: ${input.additionalSymptoms}` : ""}

Based on this data, provide a JSON response with the following structure:
{
  "predictedIssue": "The most likely issue or maintenance need",
  "severity": "low/medium/high/critical",
  "recommendedAction": "Specific action to take",
  "estimatedTimeframe": "When this should be addressed (e.g., 'Within 1 week', 'Immediate', 'Within 30 days')",
  "confidence": 0.85,
  "riskLevel": "A descriptive risk assessment (e.g., 'Low risk - routine maintenance', 'High risk - immediate attention required')",
  "additionalDetails": "Any additional context or warnings"
}

Consider factors like:
- Normal wear and tear based on mileage
- Temperature and pressure readings
- Service history
- Common failure patterns for this vehicle
- Preventive maintenance schedules`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const prediction: DiagnosticPrediction = JSON.parse(content);
    
    // Ensure confidence is between 0 and 1
    if (prediction.confidence > 1) {
      prediction.confidence = prediction.confidence / 100;
    }

    return prediction;
  } catch (error) {
    console.error("Error generating predictive diagnostic:", error);
    throw new Error("Failed to generate diagnostic prediction");
  }
}

export async function analyzeBatchDiagnostics(
  inputs: VehicleDiagnosticInput[]
): Promise<DiagnosticPrediction[]> {
  const predictions = await Promise.all(
    inputs.map((input) => generatePredictiveDiagnostic(input))
  );
  return predictions;
}
