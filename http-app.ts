import type { Express, RequestHandler } from 'express';
import helmet from 'helmet';

const healthHandler: RequestHandler = (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export function installHttpSecurity(app: Express) {
  app.set('trust proxy', 1);

  app.use(
    helmet({
      referrerPolicy: { policy: 'no-referrer' },
      strictTransportSecurity: {
        maxAge: 63_072_000,
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'blob:'],
          workerSrc: ["'self'", 'blob:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          mediaSrc: ["'self'", 'blob:', 'data:'],
          connectSrc: [
            "'self'",
            'https://generativelanguage.googleapis.com',
            'wss://generativelanguage.googleapis.com',
          ],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
        },
      },
    })
  );

  app.use((_req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(self), geolocation=(), payment=(), usb=()'
    );
    next();
  });
}

export function installHttpApiRoutes(app: Express) {
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // WebSocket upgrades are handled by live-server.ts before Express receives
  // the request. Plain HTTP requests must never fall through to the SPA.
  app.all('/api/live', (_req, res) => {
    res.status(426).json({ error: 'WebSocket upgrade required.' });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });
}
