/**
 * Google AI Studio / Gemini API Service
 */

const DEFAULT_MODEL = 'gemini-3.5-flash';

/**
 * Get API Key from localStorage or environment variables
 */
export const getApiKey = () => {
  const savedKey = localStorage.getItem('DOC_AI_API_KEY');
  if (savedKey && savedKey.trim()) {
    return savedKey.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

/**
 * Save API key to localStorage
 */
export const saveApiKey = (key) => {
  if (key) {
    localStorage.setItem('DOC_AI_API_KEY', key.trim());
  } else {
    localStorage.removeItem('DOC_AI_API_KEY');
  }
};

/**
 * Available Gemini Models
 */
export const AVAILABLE_MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (Recommended)', description: 'Fastest & most reliable document analysis' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', description: 'Next-gen reasoning engine' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', description: 'Ultra-fast lightweight model' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', description: 'Flagship reasoning model' }
];

/**
 * Standard Prompts for quick preset actions
 */
export const PRESET_PROMPTS = {
  summary: {
    title: 'Executive Summary',
    icon: 'Zap',
    prompt: `Analyze the provided document and provide a clear, structured Executive Summary.
Format your response in Markdown with the following sections:
1. 📌 **Core Summary**: A concise 3-4 sentence overview of the main topic.
2. 🔑 **Key Takeaways**: 4-6 bullet points of the most critical points.
3. 🎯 **Target Audience & Purpose**: Who this document is intended for and its primary objective.
4. 💡 **Main Conclusions**: Critical conclusions or findings.`
  },
  actionItems: {
    title: 'Action Items & Next Steps',
    icon: 'CheckSquare',
    prompt: `Extract all action items, tasks, decisions, requirements, and next steps from the document.
Format in Markdown with:
- 📋 **High Priority Tasks**: Urgent or essential actions mentioned.
- 📆 **Deadlines & Milestones**: Any dates, timeframes, or scheduled events.
- 👤 **Owner / Responsible Parties**: Who needs to act (if specified).
- ❓ **Unresolved Questions / Blockers**: Missing details or pending decisions.`
  },
  metrics: {
    title: 'Key Metrics & Data Points',
    icon: 'BarChart2',
    prompt: `Extract all key data points, numbers, statistics, percentages, financial metrics, and quantitative facts from the document.
Present them in a clear Markdown Table with columns: | Metric / Topic | Value / Figure | Context / Notes |`
  },
  quiz: {
    title: 'Quiz & Flashcards',
    icon: 'HelpCircle',
    prompt: `Based on the content of the document, generate a 5-question Multiple-Choice Quiz to test comprehension of the material.
For each question:
- Provide the Question.
- Provide options (A, B, C, D).
- Clearly state the **Correct Answer** with an **Explanation** referencing the document context.`
  },
  risks: {
    title: 'Risk & Audit Review',
    icon: 'ShieldAlert',
    prompt: `Perform a critical analysis and risk review of the document.
Identify:
1. ⚠️ **Potential Risks & Red Flags**: Vulnerabilities, financial risks, legal ambiguity, or missing information.
2. ⚖️ **Compliance & Assumptions**: Implicit assumptions made in the text.
3. 🛠️ **Recommendations**: Concrete suggestions to improve or safeguard the plan/document.`
  },
  translate: {
    title: 'Translate Document Summary',
    icon: 'Globe',
    prompt: `Summarize the document and provide the entire output translated into Spanish, French, German, and Hindi key sections.`
  }
};

/**
 * Send request to Gemini API with automatic high-demand retry & fallback
 */
export const callGeminiAPI = async ({ prompt, document, apiKey, model = DEFAULT_MODEL, chatHistory = [], retryCount = 0 }) => {
  const activeKey = apiKey || getApiKey();

  if (!activeKey) {
    throw new Error('API Key is missing. Please set your Google AI Studio API Key in the settings.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;

  const contents = [];

  // Reconstruct chat history if provided
  if (chatHistory && chatHistory.length > 0) {
    chatHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });
  }

  // Construct current turn parts
  const currentParts = [];

  // Add document context
  if (document) {
    let docContext = `DOCUMENT NAME: ${document.fileName}\nDOCUMENT TYPE: ${document.fileType}\n`;

    if (document.textContent && document.textContent.trim()) {
      docContext += `DOCUMENT CONTENT:\n"""\n${document.textContent.slice(0, 100000)}\n"""\n\n`;
    }

    currentParts.push({ text: docContext });

    // If PDF base64 is available and mimeType is pdf
    if (document.mimeType === 'application/pdf' && document.base64Content && document.rawSizeBytes < 15 * 1024 * 1024) {
      currentParts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: document.base64Content
        }
      });
    }
  }

  // Add user prompt
  currentParts.push({ text: prompt });

  contents.push({
    role: 'user',
    parts: currentParts
  });

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      // Check for high demand / rate limit / model unavailable
      const isHighDemand = errorMessage.toLowerCase().includes('demand') ||
        errorMessage.toLowerCase().includes('overloaded') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('no longer available') ||
        response.status === 429 || response.status === 503;

      if (isHighDemand) {
        // First retry with delay if under 2 retries
        if (retryCount < 2) {
          console.warn(`Model ${model} high demand spike. Retrying in 1s (attempt ${retryCount + 1})...`);
          await new Promise(r => setTimeout(r, 1000));
          return await callGeminiAPI({ prompt, document, apiKey, model, chatHistory, retryCount: retryCount + 1 });
        }
        
        // Dynamic fallback chain: gemini-3.5-flash -> gemini-3.6-flash -> gemini-flash-lite-latest
        const fallbackChain = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-lite-latest'];
        const nextFallback = fallbackChain.find(m => m !== model);

        if (nextFallback) {
          console.warn(`Falling back from ${model} to ${nextFallback}...`);
          return await callGeminiAPI({ prompt, document, apiKey, model: nextFallback, chatHistory, retryCount: 0 });
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No content returned from Gemini API. The response may have been safety filtered.');
    }

    const candidate = data.candidates[0];
    const textResult = candidate.content?.parts?.map(p => p.text).join('') || '';

    return textResult;

  } catch (err) {
    console.error('Gemini API Error:', err);
    throw err;
  }
};

/**
 * Generate Smart Suggested Questions based on Document
 */
export const generateSuggestedQuestions = async (document, apiKey, model) => {
  const prompt = `Based on the following document, generate 3 relevant, highly specific questions a user might want to ask about this file. 
Return ONLY a JSON array of strings, like: ["Question 1?", "Question 2?", "Question 3?"]
Do not add any preamble or markdown ticks.`;

  try {
    const response = await callGeminiAPI({ prompt, document, apiKey, model });
    const cleanJson = response.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return [
      `What are the main findings in ${document.fileName}?`,
      `Are there any critical dates or deadlines mentioned?`,
      `Can you explain the key terms used in this document?`
    ];
  }
};
