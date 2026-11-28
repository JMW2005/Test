// Deep Cut service worker: keeps the game playable offline.
// Bump VERSION whenever index.html or the icons change so phones pick up the update.
const VERSION = "deepcut-v2";
const SHELL = [
  "./",
  "./index.html",
  "./bank.js",
  "./bank.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: serve from cache, refresh in the background.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  // Our own files (the page, bank.js and the prompt bank): always try the network first so
  // edits to the bank show up right away, and fall back to the saved copy when offline.
  e.respondWith(
    fetch(req, {cache: "no-cache"}).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req.mode === "navigate" ? "./index.html" : req, copy)); }
      return r;
    }).catch(() => caches.match(req.mode === "navigate" ? "./index.html" : req, {ignoreSearch: true}))
  );
});
