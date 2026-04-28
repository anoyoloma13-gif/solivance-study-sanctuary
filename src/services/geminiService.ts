import { GoogleGenAI } from "@google/genai";
import { Note, PracticeQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const isAIConfigured = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined in the environment. AI tools will fail if not provided via platform.");
    return false;
  }
  return true;
};

export async function generatePracticeQuestions(notes: Note[]): Promise<PracticeQuestion[]> {
  const content = notes.map(n => n.content).join("\n\n");
  const prompt = `
    Based on the following study notes, generate 5 multiple-choice practice questions.
    Return the response as a JSON array where each object has:
    - question (string)
    - options (string array of 4 items)
    - correctAnswer (number index, 0-3)
    - explanation (string)

    Notes Content:
    ${content}
  `;

  try {
    if (!isAIConfigured()) throw new Error("Sanctuary Engine Disconnected: API Key Missing.");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}

export async function cartoonifyContent(note: Note): Promise<{ description: string; cartoonPrompt: string }> {
  const prompt = `
    Transform the following technical study note into an "Ethereal Visual Abstract".
    Aesthetic Guidelines (SOLIVANCE Style):
    - Tone: Poetic, intellectually stimulating, and dreamlike.
    - Visual Style: Studio Ghibli-inspired architectural minimalism, soft volumetric lighting, warm earth tones (sage, terracotta, sand), and organic paper textures.
    - Metaphor: Represent complex IT concepts using natural/architectural metaphors (e.g., a "Distributed System" as a network of floating lanterns in a vast library).
    
    Provide:
    1. A simplified "Core Resonance" (description): A sophisticated, narrative-driven explanation of the concept.
    2. A "Visual Prompt": A highly detailed prompt for an image generator (like Midjourney or DALL-E) to create this ethereal scene.

    Note Title: ${note.title}
    Note Content: ${note.content}

    Return JSON:
    {
      "description": "The poetic, simplified core logic",
      "cartoonPrompt": "A detailed image generation prompt following the SOLIVANCE aesthetic"
    }
  `;

  try {
    if (!isAIConfigured()) throw new Error("Sanctuary Engine Disconnected: API Key Missing.");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error cartoonifying content:", error);
    return { description: "The archives remain silent on this matter.", cartoonPrompt: "" };
  }
}

export async function searchNotes(query: string, notes: Note[]): Promise<Note[]> {
  if (!query) return [];
  
  const notesContext = notes.map(n => `ID: ${n.id}\nTitle: ${n.title}\nContent: ${n.content}`).join("\n---\n");
  const prompt = `
    You are the Guardian of the Ethereal Archive. Identify the threads of conceptual resonance between this inquiry and the stored artifacts.
    Return only a JSON array of IDs of the relevant notes, prioritized by their harmonic alignment with the query.
    
    Inquiry: ${query}
    
    Artifacts:
    ${notesContext}
  `;

  try {
    if (!isAIConfigured()) throw new Error("Sanctuary Engine Disconnected: API Key Missing.");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) return [];
    const relevantIds = JSON.parse(resultText || '[]');
    return notes.filter(n => relevantIds.includes(n.id));
  } catch (error) {
    console.error("Error searching notes:", error);
    return [];
  }
}

export async function generateStudyAid(note: Note, type: 'summary' | 'flashcards' | 'mindmap' | 'exampaper' | 'slides'): Promise<any> {
  const prompt = `
    Analyze these artifacts and manifest a ${type} within the Ethereal Study Sanctuary.
    
    Tone: Sophisticated, minimal, and authoritative yet warm.
    
    Notes: ${note.content}
    
    Structural Requirements:
    - summary: A "Harmonized Overview". Use Markdown for structure: use headings (###) for main sections, bullet points for key concepts, and bold text for critical terms. Ensure a logical, tiered flow from foundational concepts to advanced implications.
    - flashcards: "Knowledge Sparks" (JSON array: [{"question": "...", "answer": "..."}]).
    - mindmap: "Conceptual Constellation" (JSON: {"name": "Core", "children": [...]}).
    - exampaper: A "Scholarly Trial". Use Markdown with clear section headers (## Section X), numbered questions, and estimated time limits for each section.
    - slides: A "Visual Narrative" (JSON array: [{"title": "...", "bulletPoints": ["...", "..."]}]).
    
    Return the response in the requested format (JSON if specified, else plain text/markdown). Ensure the output is highly readable, aesthetically organized, and technically structured.
  `;

  try {
    if (!isAIConfigured()) throw new Error("Sanctuary Engine Disconnected: API Key Missing.");
    const config = (type === 'summary' || type === 'exampaper') ? {} : { responseMimeType: "application/json" };
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config
    });

    const resultText = response.text;
    if (!resultText) return null;

    if (type === 'summary' || type === 'exampaper') {
      return resultText;
    }
    return JSON.parse(resultText);
  } catch (error) {
    console.error(`Error generating ${type}:`, error);
    return null;
  }
}

export async function explainCode(code: string): Promise<string> {
  if (!code.trim()) return "The silence of the void contains no logic to explain.";
  
  const prompt = `
    Analyze and explain this IT artifact (code). 
    Provide a "Resonance Analysis" that is technically precise, structured, and clearly formatted.
    
    Structure the response as follows:
    1. ### Objective: The primary purpose of this artifact.
    2. ### Logic Flow: A step-by-step technical breakdown of the operations.
    3. ### Architectural Significance: Why this matters in the broader system.
    4. ### Optimization Paths: Potential improvements or considerations.
    
    Code:
    ${code}
    
    Use Markdown (headings, lists, bold text) to ensure the explanation is easy to navigate and professional.
  `;

  try {
    if (!isAIConfigured()) throw new Error("Sanctuary Engine Disconnected: API Key Missing.");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text || "The archives are hazy. I cannot decipher this logic.";
  } catch (error) {
    console.error("Error explaining code:", error);
    return "The conceptual link was severed during analysis.";
  }
}
