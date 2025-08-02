/**
 * Patch específico para interceptar fetch-patch.ts do TanStack Query
 * IMPORTANTE: Essencial para comunicação com GitHub Spark
 */

// Interceptar ANTES de qualquer biblioteca carregar
(function() {
  console.log('[PatchFetchPatch] Initializing aggressive interception');
  
  const originalFetch = window.fetch;
  const blockedUrls = [
    'redesigned-system-',
    '-4000.app.github.dev',
    'css/theme',
    'tunnels.api.visualstudio.com',
    'spark-preview--',
    'kind-fog-'
  ];
  
  // Override fetch com verificação mais agressiva
  window.fetch = function(...args: any[]): Promise<Response> {
    const url = args[0]?.toString() || '';
    
    // Verificar se é uma URL bloqueada
    const isBlocked = blockedUrls.some(pattern => url.includes(pattern));
    
    if (isBlocked) {
      console.log('[PatchFetchPatch] BLOCKED:', url);
      
      // Resposta específica para CSS theme
      if (url.includes('css/theme')) {
        return Promise.resolve(new Response('/* GitHub Spark Theme Mock */', {
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'text/css',
            'Access-Control-Allow-Origin': '*',
            'X-Intercepted': 'true'
          })
        }));
      }
      
      // Resposta genérica para outras URLs bloqueadas
      return Promise.resolve(new Response('{"intercepted":true}', {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Intercepted': 'true'
        })
      }));
    }
    
    // Permitir outras requisições
    return originalFetch.apply(window, args as any);
  };
  
  // Também interceptar Response.prototype para garantir
  const OriginalResponse = window.Response;
  window.Response = class extends OriginalResponse {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      // Adicionar headers CORS se não existirem
      if (init && !init.headers) {
        init.headers = {};
      }
      if (init?.headers && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        (init.headers as any)['Access-Control-Allow-Origin'] = '*';
      }
      super(body, init);
    }
  } as any;
  
})();

// Interceptar XMLHttpRequest também
(function() {
  const OriginalXHR = window.XMLHttpRequest;
  
  window.XMLHttpRequest = class extends OriginalXHR {
    private _url: string = '';
    
    open(method: string, url: string | URL, async?: boolean, username?: string, password?: string): void {
      this._url = url.toString();
      
      // Bloquear URLs problemáticas
      if (this._url.includes('redesigned-system-') || 
          this._url.includes('-4000.app.github.dev') ||
          this._url.includes('css/theme')) {
        
        console.log('[PatchFetchPatch] XHR BLOCKED:', this._url);
        this._url = 'data:application/json,{"intercepted":true}';
      }
      
      super.open(method, this._url, async ?? true, username, password);
    }
  } as any;
})();

export {};
