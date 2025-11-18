import { useState, useLayoutEffect, useRef, useCallback, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

/**
 * Hook para navegação responsiva com algoritmo Priority+ Nav V2
 * 
 * Estratégia baseada em MEDIÇÃO REAL do DOM (não estimativas):
 * 1. Mede largura disponível do container
 * 2. Tenta encaixar todos com label (getBoundingClientRect)
 * 3. Se não couber, calcula se precisa do botão "..."
 * 4. Compara: quantos cabem com labels vs quantos cabem só com ícones
 * 5. Escolhe o modo que mostre MAIS itens visíveis
 * 
 * SEM números mágicos. SEM thresholds fixos.
 */
export function useNavbarOverflow(items: NavItem[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const overflowBtnRef = useRef<HTMLButtonElement>(null);
  
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [isCompact, setIsCompact] = useState(false);

  /**
   * Calcula quantos itens cabem no espaço disponível
   * @param available - Largura disponível em pixels
   * @param mode - "labels" (ícone+texto) ou "icons" (apenas ícone)
   */
  const fitCount = useCallback((available: number, mode: 'labels' | 'icons'): number => {
    const list = listRef.current;
    if (!list) return 0;

    const children = Array.from(list.children) as HTMLLIElement[];
    let accumulatedWidth = 0;
    let visibleItemCount = 0;

    for (const li of children) {
      const liWidth = li.getBoundingClientRect().width;
      const labelElement = li.querySelector<HTMLElement>('.nav-item-label');
      const labelWidth = labelElement ? labelElement.getBoundingClientRect().width : 0;

      // Calcular largura do item no modo solicitado
      const itemWidth = mode === 'labels' 
        ? liWidth 
        : Math.max(0, liWidth - labelWidth); // Remove largura do label, mantém padding/ícone

      if (accumulatedWidth + itemWidth <= available) {
        accumulatedWidth += itemWidth;
        visibleItemCount++;
      } else {
        break;
      }
    }

    return visibleItemCount;
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const list = listRef.current;
    const overflowBtn = overflowBtnRef.current;
    
    if (!container || !list || !overflowBtn) return;

    // PASSO 1: Assumir que NÃO precisa do botão "Mais"
    const totalWidth = container.clientWidth;
    let visibleWithLabels = fitCount(totalWidth, 'labels');

    // Se tudo coube com labels, encerrar (sucesso!)
    if (visibleWithLabels === items.length) {
      setIsCompact(false);
      setVisibleCount(items.length);
      return;
    }

    // PASSO 2: Vai precisar do botão "Mais" - recalcular com espaço reservado
    const overflowBtnWidth = overflowBtn.offsetWidth || 60;
    const availableWidth = totalWidth - overflowBtnWidth - 8; // 8px = gap mínimo

    visibleWithLabels = fitCount(availableWidth, 'labels');
    const visibleWithIcons = fitCount(availableWidth, 'icons');

    // PASSO 3: Escolher o modo que exibe MAIS itens
    // Estratégia: preferir labels, mas se ícones permitirem mostrar mais, usar ícones
    const shouldUseCompact = visibleWithIcons > visibleWithLabels;
    
    setIsCompact(shouldUseCompact);
    setVisibleCount(shouldUseCompact ? visibleWithIcons : visibleWithLabels);
  }, [items.length, fitCount]);

  // Medição inicial após montagem
  useEffect(() => {
    measure();
  }, [measure]);

  // Observar mudanças de tamanho do container
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [measure]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  return {
    containerRef,
    listRef,
    overflowBtnRef,
    visibleItems,
    hiddenItems,
    isCompact,
    hasOverflow: hiddenItems.length > 0,
  };
}