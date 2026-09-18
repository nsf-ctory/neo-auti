import type { GoogleGenAI } from '@google/genai';
import type { RequestHandler } from 'express';

export function createChatStreamHandler(
  getGeminiClient: () => GoogleGenAI,
  serverSecurityEnforcement: string,
): RequestHandler {
  return async (req, res) => {
    let streamResponseStarted = false;
    try {
      const { messages = [], systemInstruction = '', temperature } = req.body;
      const contents = messages.map((message: any) => {
        const parts: any[] = [];
        if (message.image?.data && message.image?.mimeType) {
          parts.push({ inlineData: { mimeType: message.image.mimeType, data: message.image.data } });
        }
        if (message.content && message.content.trim()) parts.push({ text: message.content });
        return { role: message.role === 'assistant' ? 'model' : 'user', parts: parts.length ? parts : [{ text: '' }] };
      });
      const config: any = { abortSignal: res.locals.aiSignal, maxOutputTokens: 2048 };
      const baseInstruction = systemInstruction && systemInstruction.trim()
        ? systemInstruction.trim()
        : 'Você é o >_ neøtiko, o atendente e consultor oficial neøflow.';
      config.systemInstruction = `${baseInstruction}\n\n${serverSecurityEnforcement}`;
      if (typeof temperature === 'number') config.temperature = temperature;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      streamResponseStarted = true;

      const responseStream = await getGeminiClient().models.generateContentStream({
        model: process.env.TRIAGE_CHAT_MODEL || 'gemini-3.8-flash', contents, config,
      });
      let collectedSources: any[] = [];
      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        const grounding = chunk.candidates?.[0]?.groundingMetadata;
        if (grounding?.groundingChunks) collectedSources = grounding.groundingChunks;
        res.write(`data: ${JSON.stringify({ text, sources: collectedSources })}\n\n`);
      }
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
