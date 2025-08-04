/**
 * Interceptação agressiva de requisições para bloquear erros CORS do GitHub Spark
 * IMPORTANTE: Não remover - essencial para comunicação com GitHub Spark
 */

// Salvar referências originais
const originalFetch = window.fetch;
const originalXHR = window.XMLHttpRequest;

// Interceptar fetch globalmente
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url || '';
  
  // Log para debug
  console.log('[Intercept] Fetch request to:', url);
  
  // Bloquear requisições problemáticas do Spark
  if (url.includes('redesigned-system-') || 
      url.includes('css/theme') || 
      url.includes('spark-preview--') ||
      url.includes('-4000.app.github.dev') ||
      url.includes(':4000')) {
    
    console.log('[Intercept] Blocked Spark request:', url);
    
    // Retornar resposta mock para CSS theme
    if (url.includes('css/theme')) {
      return new Response('/* Mock CSS Theme for GitHub Spark */', {
        status: 200,
        headers: {
          'Content-Type': 'text/css',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }
    
    // Resposta genérica para outras requisições bloqueadas
    return new Response('{"status":"ok","blocked":true,"reason":"spark-cors-fix"}', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }
  
  // Permitir requisições normais
  return originalFetch(input, init);
};

// Interceptar XMLHttpRequest
window.XMLHttpRequest = class extends originalXHR {
  private _url: string = '';
  
  open(method: string, url: string | URL, async?: boolean, username?: string, password?: string): void {
    this._url = url.toString();
    console.log('[Intercept] XHR request to:', this._url);
    
    // Bloquear requisições problemáticas
    if (this._url.includes('redesigned-system-') || 
        this._url.includes('css/theme') || 
        this._url.includes('-4000.app.github.dev') ||
        this._url.includes(':4000')) {
      
      console.log('[Intercept] Blocked XHR request:', this._url);
      this._url = 'data:application/json,{"status":"blocked","reason":"spark-cors-fix"}';
    }
    
    super.open(method, this._url, async ?? true, username, password);
  }
};

// Bloquear WebSocket completamente para URLs problemáticas
(window as any).WebSocket = new Proxy(window.WebSocket, {
  construct: (target, args) => {
    const url = args[0];
    console.log('[Intercept] WebSocket attempt:', url);
    
    // Bloquear WebSockets problemáticos
    if (url.includes('tunnels.api.visualstudio.com') || 
        url.includes('kind-fog-') ||
        url.includes('wss://use2-data.rel.tunnels')) {
      
      console.log('[Intercept] Blocked WebSocket:', url);
      
      // Retornar mock WebSocket que não faz nada
      return {
        addEventListener: () => {},
        removeEventListener: () => {},
        send: () => {},
        close: () => {},
        readyState: 3, // CLOSED
        url: url,
        protocol: '',
        extensions: '',
        bufferedAmount: 0,
        binaryType: 'blob' as BinaryType,
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null,
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
        dispatchEvent: () => true
      } as WebSocket;
    }
    
    return new target(args[0], args[1]);
  }
});

console.log('[GitHub Spark] Request interception initialized');

export {};
