import { useNavigate, useLocation } from "react-router-dom";

export function Footer() {
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
  };

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">DormFinder</h3>
            <p className="text-muted-foreground text-sm">
              Find and book verified student dorms in Almaty
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => scrollToSection("how")}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection("search")}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Search dorms
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Get in touch
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>Prototype (no backend) - © 2025 DormFinder</p>
        </div>
      </div>
    </footer>
  );
}
