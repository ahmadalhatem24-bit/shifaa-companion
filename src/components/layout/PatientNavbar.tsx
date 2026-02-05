import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Search, 
  User, 
  Menu, 
  X,
  ChevronDown,
  Pill,
  Building2,
  FlaskConical,
  Sparkles,
  SmilePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const services = [
  { name: 'الأطباء', href: '/doctors', icon: Stethoscope },
  { name: 'طب الأسنان', href: '/dental', icon: SmilePlus },
  { name: 'الصيدليات', href: '/pharmacies', icon: Pill },
  { name: 'المستشفيات', href: '/hospitals', icon: Building2 },
  { name: 'المختبرات', href: '/labs', icon: FlaskConical },
  { name: 'التجميل', href: '/cosmetic', icon: Sparkles },
];

export function PatientNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-foreground">شريكك الطبي</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            الرئيسية
          </Link>
          
          <Link 
            to="/assistant" 
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
              location.pathname === '/assistant' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            المساعد الذكي
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                الخدمات
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {services.map((service) => (
                <DropdownMenuItem key={service.href} asChild>
                  <Link to={service.href} className="flex items-center gap-2">
                    <service.icon className="h-4 w-4" />
                    {service.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <span>{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">الملف الشخصي</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/medical-record">الملف الطبي</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/appointments">مواعيدي</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">تسجيل الدخول</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/auth?mode=signup">إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border bg-background p-4"
        >
          <nav className="flex flex-col gap-3">
            <Link to="/" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              الرئيسية
            </Link>
            <Link to="/assistant" className="py-2 text-sm font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Sparkles className="h-4 w-4" />
              المساعد الذكي
            </Link>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">الخدمات</p>
              {services.map((service) => (
                <Link 
                  key={service.href}
                  to={service.href} 
                  className="py-2 text-sm font-medium flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <service.icon className="h-4 w-4" />
                  {service.name}
                </Link>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">الملف الشخصي</Button>
                  </Link>
                  <Button variant="destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">تسجيل الدخول</Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full">إنشاء حساب</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
