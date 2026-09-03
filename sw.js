/**
 * Guarda o app inteiro no aparelho na primeira visita, para ele abrir sem internet
 * mesmo que o navegador limpe o cache comum.
 */
const CACHE = 'bienal26-v4';
const ARQUIVOS = ['./', './index.html'];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evento => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    caches.match(evento.request, { ignoreSearch: true }).then(guardado => {
      if (guardado) {
        // devolve na hora o que está guardado e atualiza por baixo, para a próxima visita
        fetch(evento.request)
          .then(r => { if (r && r.ok) caches.open(CACHE).then(c => c.put(evento.request, r.clone())); })
          .catch(() => {});
        return guardado;
      }
      return fetch(evento.request).catch(() => caches.match('./index.html'));
    })
  );
});
