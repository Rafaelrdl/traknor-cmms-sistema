import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { LogOut, User, Users } from 'lucide-react';
import { useUsers } from '@/data/usersStore';
import { IfCan } from '@/components/auth/IfCan';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavbar, DesktopNavbar } from '@/components/Navbar';
import { FirstTimeGuide, useFirstTimeGuide } from '@/components/onboarding/FirstTimeGuide';
import { TourHint } from '@/components/tour/TourHint';
import { useAutomaticWorkOrderGeneration } from '@/hooks/useWorkOrderGeneration';
import TrakNorLogoUrl from '@/assets/images/traknor-logo.svg';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { getCurrentUser } = useUsers();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { shouldShow, handleComplete, handleSkip } = useFirstTimeGuide();
  
  // Initialize automatic work order generation
  useAutomaticWorkOrderGeneration();

  const user = getCurrentUser();

  // If no user is authenticated, don't render layout
  // AuthProvider will handle redirect to login
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth:user');
    localStorage.removeItem('auth:role');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6">
          {/* Logo - Always visible, never shrinks */}
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0 min-w-fit" 
            aria-label="Página inicial"
            data-tour="logo"
          >
            <img 
              src={TrakNorLogoUrl} 
              alt="Logo TrakNor" 
              className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="font-bold text-lg sm:text-xl text-primary">TrakNor</span>
              <span className="text-xs sm:text-sm text-muted-foreground">CMMS</span>
            </div>
          </Link>

          {/* Desktop Navigation - Flex grows, can shrink */}
          <DesktopNavbar className="flex-1 min-w-0 mx-2 sm:mx-4 lg:mx-6" data-tour="navigation" />

          {/* Right Side: Mobile Menu + User Menu - Always visible, never shrinks */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-fit">
            {/* Mobile Navigation */}
            {isMobile && (
              <MobileNavbar 
                isOpen={isMobileNavOpen} 
                onOpenChange={setIsMobileNavOpen}
                data-tour="mobile-menu"
              />
            )}

            {/* User Menu - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-tour="user-menu">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    {user.avatar_url && (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    )}
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
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <IfCan action="manage" subject="user">
                  <DropdownMenuItem asChild>
                    <Link to="/admin/team" className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Equipe</span>
                    </Link>
                  </DropdownMenuItem>
                </IfCan>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {children}
      </main>
      
      {/* First Time Guide */}
      {shouldShow && (
        <FirstTimeGuide onComplete={handleComplete} onSkip={handleSkip} />
      )}
      
      {/* Tour Hint - contextual help */}
      <TourHint />
    </div>
  );
}