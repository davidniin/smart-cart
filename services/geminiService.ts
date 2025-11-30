import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CATEGORIES_PROMPT_LIST = "Frutas, Verduras y Hortalizas, Carne y Aves, Pescado y Marisco, Charcutería y Quesos, Lácteos y Huevos, Panadería y Pastelería, Pasta, Arroz y Legumbres, Aceites, Salsas y Especias, Conservas y Caldos, Desayuno y Dulces, Agua, Refrescos y Zumos, Vinos y Licores, Congelados, Limpieza y Hogar, Cuidado Personal, Bebé, Mascotas, Otros";

// 1. Analyze Image for Shopping Items using gemini-3-pro-preview
export const analyzeImageForItems = async (base64Image: string, mimeType: string): Promise<{ name: string; category: string }[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analiza esta imagen e identifica qué producto de supermercado es. Devuelve una lista de objetos detectados en formato JSON con 'name' (nombre corto en español) y 'category'.
            Las categorías permitidas son: ${CATEGORIES_PROMPT_LIST}.
            Elige la categoría más específica posible. Si no estás seguro, usa 'Otros'.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["name", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("No se pudo analizar la imagen. Inténtalo de nuevo.");
  }
};

// 2. Parse text input to items using gemini-2.5-flash (Fast & Cheap)
export const parseTextToItems = async (textInput: string): Promise<{ name: string; category: string }[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Convierte el siguiente texto de lista de compras en una estructura JSON. El texto es: "${textInput}".
      Devuelve un array de objetos con 'name' y 'category'. 
      Las categorías permitidas son: ${CATEGORIES_PROMPT_LIST}.
      Elige la categoría más específica posible.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["name", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing text:", error);
    throw error;
  }
};

// 3. Suggest Recipes from Ingredients using gemini-2.5-flash
export const suggestRecipes = async (ingredients: string): Promise<Recipe[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Tengo estos ingredientes: "${ingredients}".
      Sugiere 3 recetas creativas y deliciosas. IMPORTANTE: Prioriza recetas que utilicen la mayor cantidad posible de mis ingredientes proporcionados, minimizando la necesidad de comprar cosas nuevas, aunque puedes asumir que tengo básicos de despensa (sal, aceite, especias).
      
      Devuelve un JSON con un array de recetas. Cada receta debe tener:
      - title: Nombre del plato.
      - description: Breve descripción apetitosa (1 frase) que mencione qué ingredientes clave usa.
      - ingredients: Lista completa de ingredientes necesarios (incluyendo cantidades aproximadas).
      - instructions: Lista de pasos para cocinarlo.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "ingredients", "instructions"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error suggesting recipes:", error);
    throw new Error("No pude generar recetas. Intenta con otros ingredientes.");
  }
};

// 4. Generate Recipe Image using gemini-3-pro-image-preview
export const generateRecipeImage = async (recipeTitle: string): Promise<string> => {
  try {
    // Using 3-pro for better food aesthetics
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A professional, delicious food photography shot of ${recipeTitle}. High resolution, appetizing.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return ""; // Fallback handled in UI
  } catch (error) {
    console.error("Error generating recipe image:", error);
    return "";
  }
};

// 5. Search Grounding using gemini-2.5-flash with googleSearch
export const searchProductInfo = async (query: string): Promise<{ text: string, sources: { uri: string, title: string }[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No se encontró información.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri && w.title)
      .map((w: any) => ({ uri: w.uri, title: w.title }));

    return { text, sources };
  } catch (error) {
    console.error("Error searching:", error);
    throw new Error("Error al buscar información.");
  }
};