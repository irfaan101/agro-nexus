import { GoogleGenAI, Type } from "@google/genai";

export interface DetectionResult {
  species: string;
  disease: string;
  confidence: number;
  description: string;
  solutionEn: string;
  solutionHi: string;
  organicTreatment: string[];
}

const API_KEY = process.env.GEMINI_API_KEY;

export const detectPlantDisease = async (base64Image: string): Promise<DetectionResult> => {
  if (!API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Analyze this agricultural leaf image. Identify the plant, the specific disease (if any), and provide a 3-step organic treatment plan. Format the response in clean JSON for the UI.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.STRING },
          disease: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          solutionEn: { type: Type.STRING },
          solutionHi: { type: Type.STRING },
          organicTreatment: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["species", "disease", "confidence", "description", "solutionEn", "solutionHi", "organicTreatment"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text);
};
