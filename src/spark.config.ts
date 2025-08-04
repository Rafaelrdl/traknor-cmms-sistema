/**
 * Configuração do GitHub Spark Preview
 * IMPORTANTE: Não remover referências ao Spark e GitHub - essencial para integração
 */
export const sparkConfig = {
  // Configuração do ambiente Spark
  environment: {
    get isSparkPreview() {
      return typeof window !== 'undefined' && window.location.hostname.includes('spark-preview');
    },
    get isCodespace() {
      return typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev');
    },
    get isGitHub() {
      return typeof window !== 'undefined' && window.location.hostname === 'github.com';
    }
  },
  
  // URLs do Codespace
  codespace: {
    getUrl: () => {
      if (typeof window === 'undefined') return null;
      
      // Extrair o ID do codespace do hostname
      const hostname = window.location.hostname;
      const match = hostname.match(/([a-z]+-[a-z]+-[a-z0-9]+)/);
      if (match) {
        return `https://${match[1]}-5001.app.github.dev`;
      }
      return null;
    }
  },
  
  // Configuração de comunicação
  communication: {
    // Headers CORS necessários
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    
    // Configuração de fetch customizada
    fetchConfig: {
      mode: 'cors' as RequestMode,
      credentials: 'include' as RequestCredentials
    }
  }
};
