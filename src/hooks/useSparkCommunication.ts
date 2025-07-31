import { useEffect, useCallback } from 'react';
import { sparkConfig } from '../spark.config';

/**
 * Hook para comunicação com GitHub Spark Preview
 * IMPORTANTE: Mantém integração essencial com ferramenta Spark do GitHub
 */
export const useSparkCommunication = () => {
  // Estabelecer comunicação com o Spark Preview
  const establishConnection = useCallback(() => {
    if (!sparkConfig.environment.isSparkPreview) return;
    
    // Enviar mensagem para o parent window (GitHub)
    window.parent.postMessage({
      type: 'spark-preview-ready',
      source: 'traknor-cmms',
      codespaceUrl: sparkConfig.codespace.getUrl()
    }, 'https://github.com');
  }, []);
  
  // Interceptar requisições para o Codespace
  const interceptFetch = useCallback(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      
      // Se for uma requisição para o Codespace
      if (url.includes('app.github.dev') || url.includes('spark-preview')) {
        // Atualizar para a URL correta do Codespace
        const codespaceUrl = sparkConfig.codespace.getUrl();
        if (codespaceUrl && !url.startsWith(codespaceUrl)) {
          const newUrl = url.replace(/https:\/\/[^\/]+/, codespaceUrl);
          
          return originalFetch(newUrl, {
            ...init,
            ...sparkConfig.communication.fetchConfig,
            headers: {
              ...sparkConfig.communication.headers,
              ...init?.headers
            }
          });
        }
      }
      
      return originalFetch(input, init);
    };
  }, []);
  
  // Configurar listeners de mensagens
  const setupMessageListeners = useCallback(() => {
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://github.com') return;
      
      // Processar mensagens do Spark
      if (event.data?.type === 'spark-request') {
        // Responder com dados da aplicação
        (event.source as Window)?.postMessage({
          type: 'spark-response',
          data: {
            status: 'ready',
            appName: 'TrakNor CMMS',
            version: '1.0.0'
          }
        }, event.origin);
      }
    });
  }, []);
  
  useEffect(() => {
    establishConnection();
    interceptFetch();
    setupMessageListeners();
  }, [establishConnection, interceptFetch, setupMessageListeners]);
  
  return {
    isSparkEnvironment: sparkConfig.environment.isSparkPreview,
    codespaceUrl: sparkConfig.codespace.getUrl()
  };
};
