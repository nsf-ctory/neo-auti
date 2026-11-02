import type { GoogleGenAI } from '@google/genai';
import type { RequestHandler } from 'express';

const DEFAULT_CHAT_MODEL = 'gemini-3.5-flash';
const ALLOWED_CHAT_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite',
]);
const CHAT_MODEL_FALLBACKS = [DEFAULT_CHAT_MODEL, 'gemini-3.1-flash-lite'];

function retryableProviderStatus(error: unknown): number | undefined {
  const status = (error as { status?: unknown } | undefined)?.status;
  return typeof status === 'number' && [404, 429, 500, 502, 503, 504].includes(status)
    ? status
    : undefined;
}

function chatModelsFor(requestedModel: unknown): string[] {
  const requested = typeof requestedModel === 'string' && ALLOWED_CHAT_MODELS.has(requestedModel)
    ? requestedModel
    : undefined;
  const primary = process.env.TRIAGE_CHAT_MODEL || requested || DEFAULT_CHAT_MODEL;
  return [primary, ...CHAT_MODEL_FALLBACKS.filter((model) => model !== primary)];
}

export function createChatStreamHandler(
  getGeminiClient: () => GoogleGenAI,
  publicInstruction: string,
): RequestHandler {
  return async (req, res) => {
    let streamResponseStarted = false;
    try {
      const { messages = [], temperature, model } = req.body;
      const contents = messages.map((message: any) => {
        const parts: any[] = [];
        if (message.image?.data && message.image?.mimeType) {
          parts.push({ inlineData: { mimeType: message.image.mimeType, data: message.image.data } });
        }
        if (message.content && message.content.trim()) parts.push({ text: message.content });
        return { role: message.role === 'assistant' ? 'model' : 'user', parts: parts.length ? parts : [{ text: '' }] };
      });
      const config: any = { abortSignal: res.locals.aiSignal, maxOutputTokens: 2048 };
      // Nunca aceite prompt do browser: clientes públicos são não confiáveis.
      config.systemInstruction = publicInstruction;
      if (typeof temperature === 'number') config.temperature = temperature;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      streamResponseStarted = true;

      let collectedSources: any[] = [];
      let completed = false;
      let emittedChunk = false;
      let lastProviderError: unknown;

      for (const selectedModel of chatModelsFor(model)) {
        try {
          const responseStream = await getGeminiClient().models.generateContentStream({
            model: selectedModel, contents, config,
          });
          for await (const chunk of responseStream) {
            emittedChunk = true;
            const text = chunk.text || '';
            const grounding = chunk.candidates?.[0]?.groundingMetadata;
            if (grounding?.groundingChunks) collectedSources = grounding.groundingChunks;
            res.write(`data: ${JSON.stringify({ text, sources: collectedSources })}\n\n`);
          }
          completed = true;
          break;
        } catch (error) {
          const status = retryableProviderStatus(error);
          if (emittedChunk || !status) throw error;
          lastProviderError = error;
          console.warn(JSON.stringify({ event: 'chat_model_failover', model: selectedModel, status }));
        }
      }
      if (!completed) throw lastProviderError;
      res.write('data: [DONE]\n\n');
      res.end();
    } catch {
      console.error(JSON.stringify({ event: 'chat_provider_error' }));
      if (res.destroyed || res.writableEnded) return;
      if (!streamResponseStarted) {
        res.status(500).json({ error: 'Falha temporária no atendimento.' });
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Falha temporária no atendimento.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  };
}
