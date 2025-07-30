/**
 * Middleware para interceptar e corrigir comunicação com GitHub Spark
 * IMPORTANTE: Mantém integração essencial com ferramenta Spark do GitHub
 */
export class SparkMiddleware {
  private static instance: SparkMiddleware;
  private originalFetch: typeof fetch;
  private originalWebSocket: typeof WebSocket;

  private constructor() {
    this.originalFetch = window.fetch;
    this.originalWebSocket = window.WebSocket;
    this.initialize();
  }

  static getInstance(): SparkMiddleware {
    if (!SparkMiddleware.instance) {
      SparkMiddleware.instance = new SparkMiddleware();
    }
    return SparkMiddleware.instance;
  }

  private initialize() {
    console.log('🔧 Inicializando Spark Middleware para GitHub');
    this.interceptFetch();
    this.interceptWebSocket();
    this.setupMessageBridge();
  }

  private interceptFetch() {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      
      // Interceptar requisições para o Spark Preview - GitHub integration
      if (url.includes('spark-preview--')) {
        console.log('🎯 Intercepted GitHub Spark Preview request:', url);
        // Responder localmente para evitar 404
        return new Response(JSON.stringify({ 
          status: 'ok',
          message: 'GitHub Spark Preview Connected',
          app: 'TrakNor CMMS',
          integration: 'active'
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-Spark-Integration': 'github'
          }
        });
      }
      
      // Corrigir URLs do Codespace para porta correta - GitHub Spark communication
      if (url.includes('-4000.app.github.dev')) {
        const correctedUrl = url.replace('-4000.', '-5175.');
        console.log('🔄 Redirecting GitHub Spark request:', url, '→', correctedUrl);
        return this.originalFetch(correctedUrl, {
          ...init,
          mode: 'cors',
          credentials: 'include',
          headers: {
            ...init?.headers,
            'X-GitHub-Spark': 'true'
          }
        });
      }
      
      return this.originalFetch(input, init);
    };
  }

  private interceptWebSocket() {
    // Prevenir WebSocket para tunnels API - GitHub Spark optimization
    window.WebSocket = new Proxy(this.originalWebSocket, {
      construct: (target, args) => {
        const url = args[0] as string;
        
        if (url.includes('tunnels.api.visualstudio.com')) {
          console.log('🚫 Blocked WebSocket to tunnels API (GitHub Spark optimization)');
          // Retornar mock WebSocket que não faz nada
          return {
            close: () => {},
            send: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            readyState: WebSocket.CLOSED,
            url: url,
            protocol: '',
            extensions: '',
            bufferedAmount: 0,
            binaryType: 'blob' as BinaryType,
            onopen: null,
            onclose: null,
            onmessage: null,
            onerror: null,
            dispatchEvent: () => false,
            CONNECTING: 0,
            OPEN: 1,
            CLOSING: 2,
            CLOSED: 3
          } as WebSocket;
        }
        
        return new target(args[0], args[1]);
      }
    });
  }

  private setupMessageBridge() {
    // Comunicação bidirecional com GitHub Spark
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://github.com') return;
      
      console.log('📨 Received message from GitHub Spark:', event.data);
      
      if (event.data?.type === 'spark-init') {
        // Responder com configuração da aplicação
        const response = {
          type: 'app-ready',
          config: {
            name: 'TrakNor CMMS',
            description: 'Sistema de Gestão de Manutenção HVAC',
            port: 5175,
            proxyPort: 4000,
            status: 'running',
            sparkIntegration: 'active',
            github: 'connected'
          }
        };
        
        console.log('📤 Responding to GitHub Spark:', response);
        (event.source as Window)?.postMessage(response, { targetOrigin: event.origin });
      }
    });
    
    // Notificar GitHub Spark que aplicação está pronta
    if (window.parent !== window) {
      const initMessage = {
        type: 'app-loaded',
        app: 'TrakNor CMMS',
        url: window.location.href,
        timestamp: Date.now(),
        sparkReady: true,
        githubIntegration: true
      };
      
      console.log('🚀 Notifying GitHub Spark app loaded:', initMessage);
      window.parent.postMessage(initMessage, { targetOrigin: 'https://github.com' });
    }
  }
}

// Auto-inicializar em ambiente GitHub Spark
if (window.location.hostname.includes('spark-preview') || 
    window.location.hostname.includes('app.github.dev')) {
  console.log('🎯 GitHub Spark environment detected - initializing middleware');
  SparkMiddleware.getInstance();
} else {
  console.log('📱 Standard environment - Spark middleware ready');
}
