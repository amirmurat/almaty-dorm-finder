import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onMyRequestsClick: () => void;
}

export function Navbar({ onMyRequestsClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            DormEase
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Главная
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Как это работает
            </button>
            <button
              onClick={() => scrollToSection("search")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Поиск
            </button>
            <Link
              to="/dorms?view=map"
              className="text-foreground hover:text-primary transition-colors"
            >
              Карта
            </Link>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Контакты
            </button>
            <Button onClick={onMyRequestsClick} variant="outline" size="sm">
              Мои заявки
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button onClick={() => navigate("/app/profile")} variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </Button>
                <Button onClick={logout} variant="ghost" size="sm">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate("/auth/login")} variant="ghost" size="sm">
                  Войти
                </Button>
                <Button onClick={() => navigate("/auth/register")} variant="default" size="sm">
                  Регистрация
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

          {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <button
              onClick={() => scrollToSection("hero")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Главная
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Как это работает
            </button>
            <button
              onClick={() => scrollToSection("search")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Поиск
            </button>
            <Link
              to="/dorms?view=map"
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Карта
            </Link>
            <button
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Контакты
            </button>
            <Button onClick={onMyRequestsClick} variant="outline" size="sm" className="w-full">
              Мои заявки
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button onClick={() => { navigate("/app/profile"); setMobileMenuOpen(false); }} variant="outline" size="sm" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </Button>
                <Button onClick={() => { logout(); setMobileMenuOpen(false); }} variant="ghost" size="sm" className="w-full">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => { navigate("/auth/login"); setMobileMenuOpen(false); }} variant="ghost" size="sm" className="w-full">
                  Войти
                </Button>
                <Button onClick={() => { navigate("/auth/register"); setMobileMenuOpen(false); }} variant="default" size="sm" className="w-full">
                  Регистрация
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
