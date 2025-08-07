import { useState, useEffect } from 'react';
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
  Menu,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';

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
  const isLarge = useBreakpoint('lg');
  const isXl = useBreakpoint('xl');
  const is2Xl = useBreakpoint('2xl');

  // Determine how many items to show based on breakpoint
  const getVisibleItems = () => {
    if (is2Xl) return navigation; // Show all items on 2xl screens (≥1440px)
    if (isXl) return navigation.slice(0, 8); // Show 8 items on xl screens (≥1280px)  
    if (isLarge) return navigation.slice(0, 6); // Show 6 items on lg screens (≥1024px)
    return navigation.slice(0, 4); // Show 4 items on smaller desktop screens
  };

  const visibleItems = getVisibleItems();
  const hiddenItems = navigation.slice(visibleItems.length);

  return (
    <nav className={cn("hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-3", className)}>
      {visibleItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "nav-item",
              isActive ? "nav-item-active" : "nav-item-inactive"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden lg:inline">{item.name}</span>
          </Link>
        );
      })}
      
      {/* Overflow menu for hidden items */}
      {hiddenItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-muted hover:text-foreground px-2"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Mais opções</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {hiddenItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <DropdownMenuItem key={item.name} asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 w-full",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}