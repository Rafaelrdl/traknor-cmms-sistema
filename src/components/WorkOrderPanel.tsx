import React, { useEffect, useState } from 'react';
import { PanelLayout } from '@/components/PanelLayout';
import { WorkOrderList } from '@/components/WorkOrderList';
import { WorkOrderDetails } from '@/components/WorkOrderDetails';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import type { WorkOrder } from '@/types';

interface WorkOrderPanelProps {
  workOrders: WorkOrder[];
  onStartWorkOrder?: (id: string) => void;
  onExecuteWorkOrder?: (wo: WorkOrder) => void;
  onEditWorkOrder?: (wo: WorkOrder) => void;
}

export function WorkOrderPanel({ 
  workOrders, 
  onStartWorkOrder, 
  onExecuteWorkOrder, 
  onEditWorkOrder 
}: WorkOrderPanelProps) {
  const { selectedWorkOrder, selectedWorkOrderId, setSelectedWorkOrder, clearSelection } = useWorkOrderStore();
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL query params for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const woId = urlParams.get('wo');
    
    if (woId && woId !== selectedWorkOrderId) {
      const workOrder = workOrders.find(wo => wo.id === woId);
      if (workOrder) {
        setSelectedWorkOrder(workOrder);
      }
    }
  }, [workOrders, selectedWorkOrderId, setSelectedWorkOrder]);

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

  // Simulate loading when switching between work orders
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    if (selectedWorkOrder?.id !== workOrder.id) {
      setIsLoading(true);
      // Simulate API call delay for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }
  };

  // Auto-select first work order if none selected and list is not empty
  useEffect(() => {
    if (!selectedWorkOrderId && workOrders.length > 0) {
      const firstWorkOrder = workOrders[0];
      setSelectedWorkOrder(firstWorkOrder);
    }
  }, [workOrders, selectedWorkOrderId, setSelectedWorkOrder]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation when panel view is active
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                           document.activeElement?.tagName === 'TEXTAREA';
      
      if (isInputFocused) return;
      
      if (event.key === 'Escape' && selectedWorkOrder) {
        event.preventDefault();
        clearSelection();
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
          setSelectedWorkOrder(nextWorkOrder);
          handleSelectWorkOrder(nextWorkOrder);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workOrders, selectedWorkOrderId, selectedWorkOrder, setSelectedWorkOrder, clearSelection]);

  const detailsSlot = (
    <WorkOrderDetails
      workOrder={selectedWorkOrder}
      loading={isLoading}
      onStartWorkOrder={onStartWorkOrder}
      onExecuteWorkOrder={onExecuteWorkOrder}
      onEditWorkOrder={onEditWorkOrder}
    />
  );

  const listSlot = (
    <WorkOrderList
      workOrders={workOrders}
      compact
      onSelectWorkOrder={handleSelectWorkOrder}
      onStartWorkOrder={onStartWorkOrder}
      onExecuteWorkOrder={onExecuteWorkOrder}
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