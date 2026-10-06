const CACHE_NAME = "wordrush-pwa-v1";
const APP_CACHE_PREFIX = "wordrush-pwa-";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./assets/app-icon-180.png",
    "./assets/app-icon-192.png",
    "./assets/app-icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names
                    .filter((name) => name.startsWith(APP_CACHE_PREFIX) && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (!response.ok) return response;
                return caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, response.clone()).then(() => response));
            })
            .catch(async () => {
                const cached = await caches.match(request);
                if (cached) return cached;
                if (request.mode === "navigate") {
                    return caches.match(new URL("./", self.registration.scope).href);
                }
                return Response.error();
            })
    );
});
