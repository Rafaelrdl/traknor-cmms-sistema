import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PanelLayout } from '@/components/PanelLayout';
import { WorkOrderList } from '@/components/WorkOrderList';
import { WorkOrderDetails } from '@/components/WorkOrderDetails';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import type { WorkOrder } from '@/types';

interface WorkOrderPanelProps {
  workOrders: WorkOrder[];
  onStartWorkOrder?: (id: string) => void;
  onEditWorkOrder?: (wo: WorkOrder) => void;
}

export function WorkOrderPanel({ 
  workOrders, 
  onStartWorkOrder, 
  onEditWorkOrder 
}: WorkOrderPanelProps) {
  const { selectedWorkOrder, selectedWorkOrderId, setSelectedWorkOrder, clearSelection } = useWorkOrderStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to avoid dependency issues
  const setSelectedWorkOrderRef = useRef(setSelectedWorkOrder);
  const clearSelectionRef = useRef(clearSelection);
  
  // Keep refs updated
  useEffect(() => {
    setSelectedWorkOrderRef.current = setSelectedWorkOrder;
    clearSelectionRef.current = clearSelection;
  }, [setSelectedWorkOrder, clearSelection]);

  // Track if we've already auto-selected for this set of work orders
  const hasAutoSelectedRef = useRef(false);
  const workOrdersCountRef = useRef(workOrders.length);

  // Handle URL query params for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const woId = urlParams.get('wo');
    
    if (woId && woId !== selectedWorkOrderId) {
      const workOrder = workOrders.find(wo => wo.id === woId);
      if (workOrder) {
        setSelectedWorkOrderRef.current(workOrder);
      }
    }
  }, [workOrders, selectedWorkOrderId]);

  // Update URL when selection changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedWorkOrderId) {
      url.searchParams.set('wo', selectedWorkOrderId);
    } else {
      url.searchParams.delete('wo');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedWorkOrderId]);

  // Handle work order selection with loading simulation
  const handleSelectWorkOrder = useCallback((workOrder: WorkOrder) => {
    if (selectedWorkOrder?.id !== workOrder.id) {
      setIsLoading(true);
      setSelectedWorkOrderRef.current(workOrder);
      
      // Simulate API call delay for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }
  }, [selectedWorkOrder?.id]);

  // Auto-select first work order if none selected and list is not empty
  // Fixed version with proper dependency handling
  useEffect(() => {
    // Check if workOrders count has changed (new filter/search)
    if (workOrdersCountRef.current !== workOrders.length) {
      workOrdersCountRef.current = workOrders.length;
      hasAutoSelectedRef.current = false;
    }
    
    // Only auto-select if:
    // 1. No current selection
    // 2. We have work orders
    // 3. We haven't already auto-selected for this set
    if (!selectedWorkOrderId && workOrders.length > 0 && !hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;
      const firstWorkOrder = workOrders[0];
      setSelectedWorkOrderRef.current(firstWorkOrder);
    }
    
    // Clear the auto-selected flag if the list becomes empty
    if (workOrders.length === 0) {
      hasAutoSelectedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkOrderId, workOrders.length]); // Note: using length instead of full array

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle keyboard navigation when panel view is active
    const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                         document.activeElement?.tagName === 'TEXTAREA';
    
    if (isInputFocused) return;
    
    if (event.key === 'Escape' && selectedWorkOrder) {
      event.preventDefault();
      clearSelectionRef.current();
      return;
    }
    
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && workOrders.length > 0) {
      event.preventDefault();
      const currentIndex = selectedWorkOrderId 
        ? workOrders.findIndex(wo => wo.id === selectedWorkOrderId)
        : -1;
      
      let nextIndex;
      
      if (currentIndex === -1) {
        // No selection, select first item
        nextIndex = 0;
      } else if (event.key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : workOrders.length - 1;
      } else {
        nextIndex = currentIndex < workOrders.length - 1 ? currentIndex + 1 : 0;
      }
      
      const nextWorkOrder = workOrders[nextIndex];
      if (nextWorkOrder) {
        handleSelectWorkOrder(nextWorkOrder);
      }
    }
  }, [workOrders, selectedWorkOrderId, selectedWorkOrder, handleSelectWorkOrder]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navigation helpers
  const currentIndex = selectedWorkOrder ? workOrders.findIndex(wo => wo.id === selectedWorkOrder.id) : -1;
  const canGoNext = currentIndex >= 0 && currentIndex < workOrders.length - 1;
  const canGoPrev = currentIndex > 0;
  
  const goToNext = useCallback(() => {
    if (canGoNext && currentIndex >= 0) {
      const nextWorkOrder = workOrders[currentIndex + 1];
      if (nextWorkOrder) {
        handleSelectWorkOrder(nextWorkOrder);
      }
    }
  }, [canGoNext, currentIndex, workOrders, handleSelectWorkOrder]);
  
  const goToPrev = useCallback(() => {
    if (canGoPrev && currentIndex >= 0) {
      const prevWorkOrder = workOrders[currentIndex - 1];
      if (prevWorkOrder) {
        handleSelectWorkOrder(prevWorkOrder);
      }
    }
  }, [canGoPrev, currentIndex, workOrders, handleSelectWorkOrder]);

  const detailsSlot = (
    <div className="h-full flex flex-col">
      {/* Navigation Header */}
      {selectedWorkOrder && workOrders.length > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!canGoPrev}
              onClick={goToPrev}
              className="h-7 w-7 p-0"
              title="Ordem anterior"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!canGoNext}
              onClick={goToNext}
              className="h-7 w-7 p-0"
              title="Próxima ordem"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground ml-2">
              {currentIndex + 1} de {workOrders.length}
            </span>
          </div>
        </div>
      )}
      
      {/* Details Content */}
      <div className="flex-1 overflow-hidden">
        <WorkOrderDetails
          workOrder={selectedWorkOrder}
          loading={isLoading}
          onStartWorkOrder={onStartWorkOrder}
          onEditWorkOrder={onEditWorkOrder}
        />
      </div>
    </div>
  );

  const listSlot = (
    <WorkOrderList
      workOrders={workOrders}
      compact
      onSelectWorkOrder={handleSelectWorkOrder}
      onStartWorkOrder={onStartWorkOrder}
      onEditWorkOrder={onEditWorkOrder}
    />
  );

  return (
    <div className="w-full">
      <PanelLayout 
        detailsSlot={detailsSlot} 
        listSlot={listSlot}
        className="min-h-[600px]"
      />
      
      {/* Keyboard navigation hints */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Use ↑↓ para navegar • ESC para limpar seleção • Enter para selecionar
      </div>
    </div>
  );
}