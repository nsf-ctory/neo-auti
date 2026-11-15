import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { aiLimits, AiBudget } from './ai-guard';
import { AUTI_PUBLIC_INSTRUCTION } from './auti-policy';
import { installLiveServer } from './live-server';

dotenv.config();

function getInferenceClient(): GoogleGenAI {
  if (process.env.GEMINI_LIVE_PROVIDER === 'vertex') {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    if (!project) throw new Error('GOOGLE_CLOUD_PROJECT is required for Vertex Live');
    return new GoogleGenAI({
      vertexai: true,
      project,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is missing');
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'neo-auti' } },
  });
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const limits = aiLimits();
  const aiBudget = new AiBudget(limits);

  app.use((_req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()');
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '));
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = http.createServer(app);
  installLiveServer(
    httpServer,
    limits,
    aiBudget,
    getInferenceClient,
    AUTI_PUBLIC_INSTRUCTION,
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    for (const page of ['support', 'privacy', 'terms']) {\n      app.get(`/${page}`, (_req, res) => res.sendFile(path.join(distPath, `${page}.html`)));\n    }\n    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(JSON.stringify({ event: 'auti_server_started', port }));
  });
}

startServer().catch(() => {
  console.error(JSON.stringify({ event: 'auti_server_start_failed' }));
  process.exitCode = 1;
});
