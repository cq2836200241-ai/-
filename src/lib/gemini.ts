import { GoogleGenAI, Type } from "@google/genai";

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

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

async function fetchFromApi(prompt: string, config: ApiConfig, useJson: boolean = false) {
  const { baseUrl, apiKey, model } = config;
  
  // If it's the default Gemini setup using the sdk (no custom base url, or gemini model)
  if (!baseUrl || baseUrl.includes("generativelanguage.googleapis.com")) {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
    const params: any = {
      model: model || "gemini-2.5-flash",
      contents: prompt,
    };
    if (useJson) {
      params.config = { responseMimeType: "application/json" };
    }
    const res = await ai.models.generateContent(params);
    return res.text.trim();
  }

  // Otherwise, use generic OpenAI compatible API
  const url = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const endpoint = `${url}/chat/completions`;
  const body: any = {
    model: model || "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  };
  if (useJson) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function fetchBriefWordExplanation(
  word: string,
  config: ApiConfig
): Promise<BriefWordInfo> {
  const prompt = `Provide the phonetic spelling and a very brief Chinese explanation (max 10 chars) for the English word "${word}". Return JSON with "phonetic" and "definition".`;
  const text = await fetchFromApi(prompt, config, true);
  return JSON.parse(extractJson(text)) as BriefWordInfo;
}

export async function fetchWordPhonetic(word: string, config: ApiConfig): Promise<string> {
  const prompt = `Provide ONLY the primary IPA phonetic spelling for the English word "${word}". Enclose it in slashes. (e.g. /wɜːd/)
Response format: just the phonetic string, nothing else.`;
  return await fetchFromApi(prompt, config, false);
}

export async function fetchWordDetails(word: string, config: ApiConfig): Promise<WordDetails> {
  const prompt = `Provide detailed study information for the English word "${word}". Return a JSON object with:
- "phonetic": The IPA phonetic spelling (e.g., /wɜːd/).
- "definition": A very concise Chinese explanation of the word's core meaning with part of speech (maximum 10-15 characters, e.g., 'n. 苹果', 'v. 制作').
- "examples": An array of exactly 4 example sentences separated into English ('en') and Chinese ('zh').
- "forms": An array of morphological forms (like past tense, plural, etc) if any (e.g., ["words", "wording"]).
- "mnemonic": A clever or brief way to remember the word for Chinese learners.`;

  const text = await fetchFromApi(prompt, config, true);
  return JSON.parse(extractJson(text)) as WordDetails;
}

