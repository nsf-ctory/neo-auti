import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { aiLimits, AiBudget } from './ai-guard';
import { AUTI_PUBLIC_INSTRUCTION } from './auti-policy';
import { installHttpApiRoutes, installHttpSecurity } from './http-app';
import { installLiveServer } from './live-server';

dotenv.config({ quiet: true });

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

  installHttpSecurity(app);
  installHttpApiRoutes(app);

  const httpServer = http.createServer(app);
  installLiveServer(
    httpServer,
    limits,
    aiBudget,
    getInferenceClient,
    AUTI_PUBLIC_INSTRUCTION,
    process.env.AUTI_LIVE_VOICE || 'Charon',
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist', 'client');
    for (const page of ['support', 'privacy', 'terms']) {
      app.get(`/${page}`, (_req, res) => res.sendFile(path.join(distPath, `${page}.html`)));
    }
    app.get('/sw.js', (_req, res) => {
      res
        .type('application/javascript')
        .set({
          'Cache-Control': 'no-cache, must-revalidate',
          'Service-Worker-Allowed': '/',
        })
        .sendFile(path.join(distPath, 'sw.js'));
    });
    app.get('/manifest.webmanifest', (_req, res) => {
      res
        .type('application/manifest+json')
        .set('Cache-Control', 'no-cache, must-revalidate')
        .sendFile(path.join(distPath, 'manifest.webmanifest'));
    });
    for (const asset of [
      ['robots.txt', 'text/plain'],
      ['llms.txt', 'text/plain'],
      ['sitemap.xml', 'application/xml'],
    ] as const) {
      app.get(`/${asset[0]}`, (_req, res) => {
        res
          .type(asset[1])
          .set('Cache-Control', 'public, max-age=3600')
          .sendFile(path.join(distPath, asset[0]));
      });
    }
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
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
