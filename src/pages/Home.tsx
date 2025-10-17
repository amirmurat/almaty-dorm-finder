import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle2, Building2, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DormCard } from "@/components/DormCard";
import { RequestModal } from "@/components/RequestModal";
import { dorms, Dorm } from "@/data/dorms";
import { track } from "@/lib/tracking";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [selectedDorm, setSelectedDorm] = useState<Dorm | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    track("view_home", {});
  }, []);

  const handleSearchClick = () => {
    const element = document.getElementById("search");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleViewAllDorms = () => {
    navigate("/dorms");
  };

  const handleRequestClick = (dorm: Dorm) => {
    setSelectedDorm(dorm);
    setRequestModalOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    track("contact_submit", contactForm);
    toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
    setContactForm({ name: "", email: "", message: "" });
  };

  const featuredDorms = dorms.filter(d => d.verified).slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="py-20 md:py-32 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
            Найдите и забронируйте проверенные общежития в Алматы
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Прозрачные цены, удобства и доступность — всё в одном месте.
          </p>
          <Button size="lg" onClick={handleSearchClick} className="text-lg px-8">
            <Search className="mr-2" size={20} />
            Искать общежития
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Как это работает</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <div className="flex justify-center mb-3">
                <Search size={40} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Поиск и фильтры</h3>
              <p className="text-muted-foreground text-sm">
                Просматривайте проверенные общежития по университету, цене и удобствам
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <div className="flex justify-center mb-3">
                <Building2 size={40} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Сравнение вариантов</h3>
              <p className="text-muted-foreground text-sm">
                Изучайте детальную информацию, фото и отзывы по каждому общежитию
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <div className="flex justify-center mb-3">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Отправка заявки</h3>
              <p className="text-muted-foreground text-sm">
                Подайте заявку, и мы свяжем вас с общежитием
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section Preview */}
      <section id="search" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Рекомендуемые общежития</h2>
            <p className="text-muted-foreground">Проверенные варианты студенческого жилья</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredDorms.map(dorm => (
              <DormCard 
                key={dorm.id} 
                dorm={dorm} 
                onRequestClick={handleRequestClick}
              />
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={handleViewAllDorms}>
              Смотреть все общежития и фильтры
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section id="featured" className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Почему DormEase?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <CheckCircle2 className="text-success mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Проверенные объявления</h3>
              <p className="text-sm text-muted-foreground">
                Все общежития проверены на достоверность
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Search className="text-primary mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Умный поиск</h3>
              <p className="text-sm text-muted-foreground">
                Фильтры по цене, местоположению, удобствам
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Clock className="text-secondary mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Экономия времени</h3>
              <p className="text-sm text-muted-foreground">
                Сравнивайте все варианты в одном месте
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Building2 className="text-accent mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Широкий выбор</h3>
              <p className="text-sm text-muted-foreground">
                Общежития возле всех крупных университетов
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Как забронировать общежитие?</AccordionTrigger>
              <AccordionContent>
                Просмотрите доступные общежития, нажмите «Оставить заявку» на понравившемся варианте, заполните форму своими данными и отправьте. Мы свяжем вас с администрацией общежития.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Все ли объявления проверены?</AccordionTrigger>
              <AccordionContent>
                Общежития с бейджем «Проверено» проверены нашей командой. Мы постоянно работаем над проверкой всех объявлений на платформе.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Какие способы оплаты принимаются?</AccordionTrigger>
              <AccordionContent>
                Условия оплаты различаются в зависимости от общежития. После подачи заявки администрация общежития свяжется с вами и сообщит конкретную информацию об оплате и доступных способах.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Можно ли посетить общежитие перед бронированием?</AccordionTrigger>
              <AccordionContent>
                Да! Мы рекомендуем лично посетить общежитие. После подачи заявки вы сможете договориться о визите с администрацией общежития.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Это настоящая платформа для бронирования?</AccordionTrigger>
              <AccordionContent>
                Это демонстрационный прототип без бэкенда. Все данные хранятся локально в вашем браузере. В производственной версии заявки будут отправляться администрации общежитий.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <Mail className="text-primary mx-auto mb-4" size={48} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Свяжитесь с нами</h2>
            <p className="text-muted-foreground">
              Есть вопросы? Мы здесь, чтобы помочь!
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-card p-6 md:p-8 rounded-lg border border-border space-y-4">
            <div>
              <Label htmlFor="contact-name">Имя</Label>
              <Input
                id="contact-name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Ваше имя"
              />
            </div>

            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="contact-message">Сообщение</Label>
              <Textarea
                id="contact-message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Как мы можем вам помочь?"
                rows={5}
              />
            </div>

            <Button type="submit" className="w-full">
              Отправить сообщение
            </Button>
          </form>
        </div>
      </section>

      <RequestModal 
        dorm={selectedDorm}
        open={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          setSelectedDorm(null);
        }}
      />
    </>
  );
}
