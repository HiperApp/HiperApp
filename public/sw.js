// Service Worker do HiperApp
// Responsável por: (1) permitir instalação como app (PWA)
// (2) cache básico para funcionar offline nas telas já visitadas
// (3) exibir notificações locais de lembrete de medição

const CACHE_NAME = "hiperapp-cache-v1";
const ASSETS_BASICOS = ["/dashboard", "/manifest.json", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_BASICOS).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estratégia simples: tenta rede, cai para cache se offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});

// Notificação disparada localmente pelo app (setTimeout registrado
// na página) ou recebida via Web Push de um servidor, se configurado.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "MOSTRAR_LEMBRETE") {
    self.registration.showNotification("HiperApp", {
      body: event.data.mensagem || "Está na hora de medir sua pressão! ❤️",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "lembrete-medicao",
      requireInteraction: false,
    });
  }
});

self.addEventListener("push", (event) => {
  let dados = { title: "HiperApp", body: "Está na hora de medir sua pressão! ❤️" };
  try {
    if (event.data) dados = event.data.json();
  } catch {
    // payload em texto simples, mantém o padrão acima
  }
  event.waitUntil(
    self.registration.showNotification(dados.title || "HiperApp", {
      body: dados.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/dashboard") && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/dashboard");
    })
  );
});
