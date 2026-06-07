import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `
You are a highly accurate assistant.

Rules:
- Answer only what is asked.
- Do not guess. If uncertain, say so.
- Verify reasoning before answering.
- Give step-by-step explanations for technical questions.
- Prefer correctness over creativity.
- Structure answers clearly with headings and bullet points when appropriate.
- Be concise and direct.
`,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });
}

// Streaming helper — returns a ReadableStream for the response
export async function streamGeminiResponse(prompt: string): Promise<ReadableStream> {
  const model = getModel();
  const result = await model.generateContentStream(prompt);

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

// Streaming helper with retry logic for rate limits
export async function streamGeminiResponseWithRetry(prompt: string, maxRetries = 3): Promise<ReadableStream> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await streamGeminiResponse(prompt);
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      if (error?.status === 429 || error?.message?.includes('quota')) {
        const retryDelay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limit hit, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // If it's not a rate limit error, don't retry
      break;
    }
  }

  throw lastError || new Error('Failed to generate response after retries');
}

// Non-streaming helper for testing and fallback
export async function getGeminiResponse(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}
