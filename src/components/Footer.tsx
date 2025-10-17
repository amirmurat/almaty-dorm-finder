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
            <h3 className="font-bold text-lg mb-3">DormEase</h3>
            <p className="text-muted-foreground text-sm">
              Найдите и забронируйте проверенные общежития в Алматы
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Быстрые ссылки</h4>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => scrollToSection("how")}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Как это работает
              </button>
              <button
                onClick={() => scrollToSection("search")}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Искать общежития
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
            <h4 className="font-semibold mb-3">Контакты</h4>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Связаться с нами
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>Прототип (без бэкенда) - © 2025 DormEase</p>
        </div>
      </div>
    </footer>
  );
}
