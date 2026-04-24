import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface WordDetails {
  phonetic: string;
  definition: string;
  examples: { en: string; zh: string }[];
  forms: string[];
  mnemonic: string;
}

export interface BriefWordInfo {
  phonetic: string;
  definition: string;
}

export async function fetchBriefWordExplanation(
  word: string,
): Promise<BriefWordInfo> {
  const prompt = `Provide the phonetic spelling and a very brief Chinese explanation (max 10 chars) for the English word "${word}". Return JSON with "phonetic" and "definition".`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          phonetic: { type: Type.STRING },
          definition: { type: Type.STRING },
        },
        required: ["phonetic", "definition"],
      },
    },
  });

  return JSON.parse(response.text.trim()) as BriefWordInfo;
}

export async function fetchWordPhonetic(word: string): Promise<string> {
  const prompt = `Provide ONLY the primary IPA phonetic spelling for the English word "${word}". Enclose it in slashes. (e.g. /wɜːd/)
Response format: just the phonetic string, nothing else.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text.trim();
}

export async function fetchWordDetails(word: string): Promise<WordDetails> {
  const prompt = `Provide detailed study information for the English word "${word}". Return a JSON object with:
- "phonetic": The IPA phonetic spelling (e.g., /wɜːd/).
- "definition": A very concise Chinese explanation of the word's core meaning with part of speech (maximum 10-15 characters, e.g., 'n. 苹果', 'v. 制作').
- "examples": An array of exactly 4 example sentences separated into English ('en') and Chinese ('zh').
- "forms": An array of morphological forms (like past tense, plural, etc) if any (e.g., ["words", "wording"]).
- "mnemonic": A clever or brief way to remember the word for Chinese learners.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          phonetic: { type: Type.STRING },
          definition: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING },
                zh: { type: Type.STRING },
              },
              required: ["en", "zh"],
            },
          },
          forms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          mnemonic: { type: Type.STRING },
        },
        required: ["phonetic", "definition", "examples", "forms", "mnemonic"],
      },
    },
  });

  return JSON.parse(response.text.trim()) as WordDetails;
}
