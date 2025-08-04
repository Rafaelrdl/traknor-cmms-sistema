/**
 * Service Worker para interceptar requisições no nível de rede
 * GitHub Spark CORS Fix
 */

const BLOCKED_PATTERNS = [
  'redesigned-system-',
  '-4000.app.github.dev',
  'css/theme',
  'tunnels.api.visualstudio.com',
  'spark-preview--',
  'kind-fog-'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Spark Intercept Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Spark Intercept Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Verificar se deve bloquear
  const shouldBlock = BLOCKED_PATTERNS.some(pattern => url.includes(pattern));
  
  if (shouldBlock) {
    console.log('[SW] Blocked request:', url);
    
    // Resposta para CSS
    if (url.includes('css/theme')) {
      event.respondWith(
        new Response('/* Spark Theme from SW */', {
          status: 200,
          headers: {
            'Content-Type': 'text/css',
            'Access-Control-Allow-Origin': '*'
          }
        })
      );
      return;
    }
    
    // Resposta genérica
    event.respondWith(
      new Response('{"blocked_by":"service-worker"}', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    );
  }
});
