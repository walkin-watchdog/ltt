import fs   from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import fetch from 'node-fetch';

let url = process.env.BACKEND_SITEMAP_URL 
       ?? 'https://localhost:3001/sitemap.xml';

const TARGET = new URL('../public/sitemap.xml', import.meta.url);

const u = new URL(url);
if (['localhost', '127.0.0.1'].includes(u.hostname)) {
  u.protocol = 'http:';
  url = u.toString();
}

const agent = u.protocol === 'https:' ? new https.Agent() : new http.Agent();

try {
  const res = await fetch(url, { agent, headers: { 'Accept': 'application/xml' }});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  await fs.writeFile(TARGET, xml, 'utf8');
  console.log(`✔ sitemap.xml refreshed from ${url}`);
} catch (err) {
  console.error('✖ Failed to refresh sitemap:', err);
  process.exit(1);
}