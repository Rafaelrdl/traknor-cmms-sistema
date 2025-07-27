import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  Home,
  Package,
  ClipboardList,
  MessageSquare,
  Calendar,
  BarChart3,
  Warehouse,
  FileText,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useUser } from '@/hooks/useData';
import TrakNorLogo from '@/assets/images/traknor-logo.svg.svg';

const navigation = [
  { name: 'Visão Geral', href: '/', icon: Home },
  { name: 'Ativos', href: '/equipment', icon: Package },
  { name: 'Ordens de Serviço', href: '/work-orders', icon: ClipboardList },
  { name: 'Solicitações', href: '/requests', icon: MessageSquare },
  { name: 'Planos', href: '/plans', icon: Calendar },
  { name: 'Métricas', href: '/metrics', icon: BarChart3 },
  { name: 'Estoque', href: '/inventory', icon: Warehouse },
  { name: 'Relatórios', href: '/reports', icon: FileText },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [user] = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-8 hover:opacity-80 transition-opacity" aria-label="Página inicial">
            <img 
              src={TrakNorLogo} 
              alt="Logo TrakNor" 
              className="h-8 w-8 mr-2"
            />
            <span className="font-bold text-xl text-primary">TrakNor</span>
            <span className="text-sm text-muted-foreground ml-2">CMMS</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6 flex-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}