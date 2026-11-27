// Offline support: keep the app shell cached, and cache fonts once they've loaded.
const CACHE = "look-through-v3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Only handle the app's own files and its fonts; price requests always go to the network.
  const host = new URL(e.request.url).hostname;
  if (new URL(e.request.url).origin !== self.location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(host)) return;
  // Network first, so updates show up when online; fall back to the cache when offline.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
