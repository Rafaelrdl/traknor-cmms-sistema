import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Home,
  Package,
  ClipboardList,
  MessageSquare,
  Calendar,
  BarChart3,
  Warehouse,
  BookOpen,
  FileText,
  HelpCircle,
  Menu,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavbarOverflow } from '@/hooks/useNavbarOverflow';

// Ordem original dos itens - será preservada na responsividade
const navigation = [
  { name: 'Visão Geral', href: '/', icon: Home },
  { name: 'Ativos', href: '/ativos', icon: Package },
  { name: 'Ordens de Serviço', href: '/work-orders', icon: ClipboardList },
  { name: 'Solicitações', href: '/requests', icon: MessageSquare },
  { name: 'Planos', href: '/plans', icon: Calendar },
  { name: 'Métricas', href: '/metrics', icon: BarChart3 },
  { name: 'Estoque', href: '/inventory', icon: Warehouse },
  { name: 'Procedimentos', href: '/procedures', icon: BookOpen },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Ajuda', href: '/help', icon: HelpCircle },
];

interface MobileNavbarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavbar({ isOpen, onOpenChange }: MobileNavbarProps) {
  const location = useLocation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onOpenChange]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="md:hidden relative p-2"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="w-full h-screen p-0 border-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full bg-background flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-start p-4 border-b border-border">
                <span className="font-semibold text-lg">Menu de Navegação</span>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 space-y-2">
                  {navigation.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            "mobile-nav-item",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

interface DesktopNavbarProps {
  className?: string;
}

export function DesktopNavbar({ className }: DesktopNavbarProps) {
  const location = useLocation();
  
  // Hook dinâmico Priority+ Nav V2 (medição real do DOM)
  const { 
    containerRef, 
    listRef,
    overflowBtnRef,
    visibleItems, 
    hiddenItems, 
    isCompact, 
    hasOverflow 
  } = useNavbarOverflow(navigation);

  return (
    <nav 
      ref={containerRef}
      className={cn("hidden md:flex items-center overflow-hidden flex-1", className)}
      data-compact={isCompact ? "true" : "false"}
    >
      {/* Lista de itens com min-width:0 para prevenir overflow */}
      <ul 
        ref={listRef}
        className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden"
      >
        {/* Renderizar TODOS os itens (para medição), mas apenas visibleCount serão mostrados */}
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          const isVisible = index < visibleItems.length;
          
          return (
            <li 
              key={item.name}
              className={cn(
                "flex-shrink-0",
                !isVisible && "hidden"
              )}
            >
              <Link
                to={item.href}
                className={cn(
                  "nav-item flex items-center gap-2 transition-all duration-200",
                  isActive ? "nav-item-active" : "nav-item-inactive"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {/* Label sempre renderizado (para medição), mas escondido via CSS quando compact */}
                <span className="nav-item-label whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
        
      {/* Botão overflow - SEMPRE renderizado (para medição), mas escondido quando não necessário */}
      <div className={cn(
        "flex-shrink-0 ml-2",
        !hasOverflow && "invisible pointer-events-none"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={overflowBtnRef}
              variant="ghost"
              size="sm"
              className="nav-overflow-menu text-muted-foreground hover:bg-muted hover:text-foreground px-2"
              aria-label={`Mais ${hiddenItems.length} opções de navegação`}
              aria-expanded={hasOverflow}
            >
              <MoreHorizontal className="h-4 w-4" />
              {hasOverflow && (
                <span className="nav-overflow-badge ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-medium">
                  {hiddenItems.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          {hasOverflow && (
            <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto">
              {hiddenItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 w-full cursor-pointer",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {/* Menu de overflow sempre mostra texto completo */}
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </nav>
  );
}