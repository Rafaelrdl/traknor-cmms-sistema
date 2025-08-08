import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useCurrentBreakpoint } from '@/hooks/useBreakpoint';

interface PanelLayoutProps {
  detailsSlot: ReactNode;
  listSlot: ReactNode;
  className?: string;
}

export function PanelLayout({ detailsSlot, listSlot, className }: PanelLayoutProps) {
  const currentBreakpoint = useCurrentBreakpoint();
  const isMobile = currentBreakpoint === 'sm';
  
  // On mobile, we'll show only the list by default
  // The details view will be handled by navigation in the parent component
  if (isMobile) {
    return (
      <div className={cn("h-[600px] border rounded-lg overflow-hidden bg-card", className)}>
        {listSlot}
      </div>
    );
  }

  return (
    <div className={cn("flex h-[600px] border rounded-lg overflow-hidden bg-card", className)}>
      {/* Details Panel - Left side (72% desktop, 65% tablet) */}
      <div className="flex-1 lg:flex-[0.72] md:flex-[0.65] border-r overflow-hidden">
        {detailsSlot}
      </div>
      
      {/* List Panel - Right side (28% desktop, 35% tablet) */}
      <div className="w-full lg:w-[28%] md:w-[35%] flex-shrink-0 overflow-hidden">
        {listSlot}
      </div>
    </div>
  );
}