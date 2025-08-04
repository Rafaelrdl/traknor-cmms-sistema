/**
 * Patch para TanStack Query para prevenir requisições problemáticas
 * IMPORTANTE: Não remover - essencial para GitHub Spark communication
 */

// Interceptar criação de QueryClient se existir
if (typeof window !== 'undefined') {
  // Aguardar carregamento do TanStack Query
  const checkForQueryClient = () => {
    if ((window as any).QueryClient) {
      const OriginalQueryClient = (window as any).QueryClient;
      
      (window as any).QueryClient = class extends OriginalQueryClient {
        constructor(config?: any) {
          // Modificar configuração padrão
          const modifiedConfig = {
            ...config,
            defaultOptions: {
              ...config?.defaultOptions,
              queries: {
                ...config?.defaultOptions?.queries,
                // Desabilitar retry para requisições problemáticas
                retry: (failureCount: number, error: any) => {
                  const url = error?.config?.url || error?.request?.responseURL || '';
                  if (url.includes('redesigned-system-') || 
                      url.includes('css/theme') ||
                      url.includes('-4000.app.github.dev')) {
                    console.log('[TanStack Query] Disabling retry for blocked URL:', url);
                    return false;
                  }
                  return failureCount < 3;
                },
                // Timeout rápido para requisições problemáticas
                staleTime: (query: any) => {
                  const url = query?.queryKey?.[0] || '';
                  if (typeof url === 'string' && 
                      (url.includes('redesigned-system-') || url.includes('css/theme'))) {
                    return 0; // Immediate stale
                  }
                  return 5 * 60 * 1000; // 5 minutes default
                }
              }
            }
          };
          
          super(modifiedConfig);
          console.log('[TanStack Query] Patched with GitHub Spark fixes');
        }
      };
      
      console.log('[GitHub Spark] TanStack Query patched successfully');
    } else {
      // Tentar novamente em 100ms se QueryClient ainda não carregou
      setTimeout(checkForQueryClient, 100);
    }
  };
  
  // Verificar imediatamente e também aguardar carregamento
  checkForQueryClient();
  
  // Observer para quando elementos DOM são adicionados
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if ((window as any).QueryClient && !(window as any).__sparkQueryPatched) {
        (window as any).__sparkQueryPatched = true;
        checkForQueryClient();
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

export {};
