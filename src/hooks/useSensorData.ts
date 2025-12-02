import { useState, useEffect } from 'react';
import { assetsService } from '@/apps/monitor/services/assetsService';
import type { AssetSensor } from '@/apps/monitor/types/asset';

interface UseSensorDataResult {
  value: number | null;
  unit: string;
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  sensor: AssetSensor | null;
}

/**
 * Hook para buscar dados em tempo real de um sensor específico
 * Usa sensorTag e assetId do widget config para buscar o último valor
 * 
 * @param sensorTag - Tag única do sensor configurado no widget
 * @param assetId - ID do asset ao qual o sensor pertence
 * @param refreshInterval - Intervalo de atualização em milissegundos (padrão: 30s)
 */
export function useSensorData(
  sensorTag: string | undefined, 
  assetId: number | undefined,
  refreshInterval = 30000
): UseSensorDataResult {
  const [data, setData] = useState<UseSensorDataResult>({
    value: null,
    unit: '',
    isOnline: false,
    isLoading: true,
    error: null,
    sensor: null,
  });

  useEffect(() => {
    if (!sensorTag || !assetId) {
      // Para widgets sem sensor configurado, retornar estado vazio sem erro
      setData({
        value: null,
        unit: '',
        isOnline: false,
        isLoading: false,
        error: null,
        sensor: null,
      });
      return;
    }

    let isMounted = true;

    const fetchSensorData = async () => {
      try {
        if (!isMounted) return;
        
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Buscar todos os sensores do asset
        const sensors = await assetsService.getSensors(assetId);
        
        // Encontrar sensor específico pela tag
        const targetSensor = sensors.find(s => s.tag === sensorTag);
        
        if (!targetSensor) {
          if (!isMounted) return;
          setData({
            value: null,
            unit: '',
            isOnline: false,
            isLoading: false,
            error: `Sensor ${sensorTag} não encontrado`,
            sensor: null,
          });
          return;
        }
        
        if (!isMounted) return;
        
        setData({
          value: targetSensor.last_value,
          unit: targetSensor.unit || '',
          isOnline: targetSensor.is_online,
          isLoading: false,
          error: null,
          sensor: targetSensor,
        });
        
      } catch (error: any) {
        console.error('❌ Erro ao buscar dados do sensor:', error);
        if (!isMounted) return;
        
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Erro ao carregar dados do sensor',
        }));
      }
    };

    fetchSensorData();
    
    // Configurar refresh automático
    const intervalId = setInterval(fetchSensorData, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [sensorTag, assetId, refreshInterval]);

  return data;
}

/**
 * Avalia uma fórmula de transformação de valor
 * @param formula - Fórmula com $VALUE$ como placeholder
 * @param value - Valor do sensor
 * @returns Valor transformado ou original se fórmula inválida
 */
export function evaluateFormula(formula: string | undefined, value: number | null): number | string | null {
  if (!formula || value === null) return value;
  
  try {
    // Substituir $VALUE$ pelo valor real
    const expression = formula.replace(/\$VALUE\$/g, String(value));
    // Avaliar expressão de forma segura
    const result = Function('"use strict"; return (' + expression + ')')();
    return result;
  } catch (error) {
    console.warn('Erro ao avaliar fórmula:', error);
    return value;
  }
}
