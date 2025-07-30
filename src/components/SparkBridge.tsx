import { useEffect } from 'react';
import { useSparkCommunication } from '../hooks/useSparkCommunication';

/**
 * Componente ponte para comunicação com GitHub Spark Preview
 * IMPORTANTE: Essencial para integração com ferramenta Spark do GitHub
 */
export const SparkBridge = () => {
  const { isSparkEnvironment, codespaceUrl } = useSparkCommunication();
  
  useEffect(() => {
    if (!isSparkEnvironment) return;
    
    // Criar iframe invisível para estabelecer comunicação
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `${codespaceUrl}/spark-bridge`;
    document.body.appendChild(iframe);
    
    // Cleanup
    return () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
  }, [isSparkEnvironment, codespaceUrl]);
  
  return null;
};
