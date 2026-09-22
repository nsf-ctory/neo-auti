import { Modality, type GoogleGenAI, type LiveServerMessage } from '@google/genai';
import type { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { AiBudget, aiLimits, isOriginAllowed } from './ai-guard';

export function installLiveServer(httpServer: Server, limits: ReturnType<typeof aiLimits>,
  aiBudget: AiBudget, getGeminiClient: () => GoogleGenAI, enforcement: string) {
  const wss = new WebSocketServer({
    server: httpServer, path: '/api/live', maxPayload: limits.maxPayload,
    verifyClient: ({ origin }) => limits.enabled && isOriginAllowed(origin, limits.origins),
  });

  wss.on('connection', (clientWs: WebSocket) => {
    const release = aiBudget.acquire();
    if (!release) { clientWs.close(1013, 'Atendimento ocupado.'); return; }
    let session: any = null;
    let isClosed = false;
    let setupStarted = false;
    let setupPending = false;
    let messageWindow = Date.now();
    let messages = 0;
    const setupTimer = setTimeout(() => clientWs.terminate(), limits.setupTimeoutMs);
    const durationTimer = setTimeout(() => clientWs.terminate(), limits.liveDurationMs);
    clientWs.on('error', () => clientWs.terminate());

    clientWs.on('message', async (raw) => {
      try {
        if (isClosed) return;
        if (Date.now() - messageWindow >= 1000) { messageWindow = Date.now(); messages = 0; }
        if (++messages > limits.messagesPerSecond) { clientWs.terminate(); return; }
        const msg = JSON.parse(raw.toString());
        if (!msg || typeof msg !== 'object' || Array.isArray(msg)) { clientWs.terminate(); return; }

        if (msg.setup) {
          if (setupStarted) { clientWs.terminate(); return; }
          setupStarted = true; // Reserve before awaiting the provider connection.
          if (typeof msg.setup !== 'object' ||
              (msg.setup.systemInstruction !== undefined && typeof msg.setup.systemInstruction !== 'string')) {
            clientWs.terminate(); return;
          }
          const { systemInstruction, voice = 'Kore' } = msg.setup;
          const ai = getGeminiClient();

          const liveBaseInstruction =
            systemInstruction && systemInstruction.trim()
              ? systemInstruction.trim()
              : 'Você é o >_ neøtiko, o atendente e consultor oficial neøflow.';
          const finalLiveInstruction = `${liveBaseInstruction}\n\n${enforcement}`;

          setupPending = true;
          try {
            session = await ai.live.connect({
              model: 'gemini-3.1-flash-live-preview',
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
                  },
                },
                systemInstruction: finalLiveInstruction,
                outputAudioTranscription: {},
                inputAudioTranscription: {},
              },
              callbacks: {
                onmessage: (message: LiveServerMessage) => {
                  if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

                  const audio =
                    message.serverContent?.modelTurn?.parts?.[0]?.inlineData
                      ?.data;
                  const interrupted = message.serverContent?.interrupted;
                  const turnComplete = message.serverContent?.turnComplete;

                  // Transcriptions if emitted
                  const outputTranscription = (message.serverContent as any)
                    ?.outputAudioTranscription?.text;
                  const inputTranscription = (message.serverContent as any)
                    ?.inputAudioTranscription?.text;

                  clientWs.send(
                    JSON.stringify({
                      audio,
                      interrupted,
                      turnComplete,
                      outputTranscription,
                      inputTranscription,
                    })
                  );
                },
                onclose: () => {
                  if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ closed: true }));
                  }
                },
                onerror: () => {
                  console.error(JSON.stringify({ event: 'live_provider_error' }));
                  if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({ error: 'Falha temporária no atendimento.' })
                    );
                  }
                },
              },
            });

          } finally {
            setupPending = false;
            if (isClosed) release();
          }
          clearTimeout(setupTimer);
          if (isClosed) { session.close(); return; }
          clientWs.send(JSON.stringify({ ready: true }));
          return;
        }

        if (typeof msg.audio === 'string' && session) {
          session.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (err: any) {
        console.error(JSON.stringify({ event: 'live_message_error' }));
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({ error: 'Falha temporária no atendimento.' })
          );
        }
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      clearTimeout(setupTimer);
      clearTimeout(durationTimer);
      if (!setupPending) release();
      if (session) {
        try {
          session.close();
        } catch (e) {
          console.error(JSON.stringify({ event: 'live_close_error' }));
        }
      }
    });
  });

  return wss;
}
