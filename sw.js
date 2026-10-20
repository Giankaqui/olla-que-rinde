// Service worker mínimo: red primero y, si no hay conexión, lo último guardado.
const CACHE = 'olla-que-rinde-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return
  evento.respondWith(
    fetch(pedido)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone()
          caches.open(CACHE).then((c) => c.put(pedido, copia))
        }
        return respuesta
      })
      .catch(
        async () =>
          (await caches.match(pedido, { ignoreVary: true })) || (pedido.mode === 'navigate' && (await caches.match('./', { ignoreVary: true }))) || Response.error(),
      ),
  )
})
