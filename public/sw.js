self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
// La aplicación está diseñada para funcionar online. No interceptamos ni cacheamos contenido dinámico.
self.addEventListener("fetch", () => {});
