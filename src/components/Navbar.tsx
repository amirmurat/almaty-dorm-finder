import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onMyRequestsClick: () => void;
}

export function Navbar({ onMyRequestsClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
              Home
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="text-foreground hover:text-primary transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection("search")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Search
            </button>
            <Link
              to="/dorms?view=map"
              className="text-foreground hover:text-primary transition-colors"
            >
              Map
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
              Contact
            </button>
            <Button onClick={onMyRequestsClick} variant="outline" size="sm">
              My Requests
            </Button>
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
              Home
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection("search")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Search
            </button>
            <Link
              to="/dorms?view=map"
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Map
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
              Contact
            </button>
            <Button onClick={onMyRequestsClick} variant="outline" size="sm" className="w-full">
              My Requests
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
