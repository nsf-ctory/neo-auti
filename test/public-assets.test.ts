import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('public discovery files expose pages but keep API routes out of crawlers', async () => {
  const robots = await readFile('public/robots.txt', 'utf8');
  for (const agent of [
    '*',
    'GPTBot',
    'OAI-SearchBot',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'Google-Extended',
    'PerplexityBot',
  ]) {
    const group = robots.split(/\n\n/).find((entry) =>
      entry.includes(`User-agent: ${agent}`)
    );
    assert.ok(group, `missing crawler group: ${agent}`);
    assert.match(group, /Allow: \/(?:\n|$)/);
    assert.match(group, /Disallow: \/api\/(?:\n|$)/);
  }
  assert.match(robots, /Sitemap: https:\/\/auti\.neoprotocol\.space\/sitemap\.xml/);

  const sitemap = await readFile('public/sitemap.xml', 'utf8');
  assert.match(sitemap, /https:\/\/auti\.neoprotocol\.space\/<\/loc>/);
  assert.doesNotMatch(sitemap, /\/api\//);
});

test('PWA manifest and service worker use a versioned, API-safe cache', async () => {
  const manifest = JSON.parse(
    await readFile('public/manifest.webmanifest', 'utf8')
  );
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.deepEqual(
    manifest.icons.map((icon: { sizes: string }) => icon.sizes),
    ['192x192', '512x512']
  );
  await Promise.all(
    manifest.icons.map((icon: { src: string }) =>
      access(`public${icon.src}`)
    )
  );

  const serviceWorker = await readFile('public/sw.js', 'utf8');
  assert.match(serviceWorker, /CACHE_VERSION = 'auti-shell-[^']+'/);
  assert.match(serviceWorker, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.doesNotMatch(serviceWorker, /GEMINI_API_KEY|AUTI_PUBLIC_INSTRUCTION/);
});

test('browser setup carries no provider model, voice or system instruction', async () => {
  const liveClient = await readFile('src/components/LiveVoiceModal.tsx', 'utf8');
  assert.match(liveClient, /JSON\.stringify\(\{ setup: \{\} \}\)/);
  assert.doesNotMatch(liveClient, /systemInstruction|GEMINI|Charon|Kore|Puck|Fenrir|Zephyr/);
});
