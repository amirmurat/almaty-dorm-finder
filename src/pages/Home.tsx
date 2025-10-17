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
      toast.error("Please fill in all fields");
      return;
    }

    track("contact_submit", contactForm);
    toast.success("Message sent! We'll get back to you soon.");
    setContactForm({ name: "", email: "", message: "" });
  };

  const featuredDorms = dorms.filter(d => d.verified).slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="py-20 md:py-32 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
            Find and book verified student dorms in Almaty
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transparent prices, amenities, and availability — all in one place.
          </p>
          <Button size="lg" onClick={handleSearchClick} className="text-lg px-8">
            <Search className="mr-2" size={20} />
            Search dorms
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <div className="flex justify-center mb-3">
                <Search size={40} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Search & Filter</h3>
              <p className="text-muted-foreground text-sm">
                Browse verified dorms by university, price, and amenities
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <div className="flex justify-center mb-3">
                <Building2 size={40} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Compare Options</h3>
              <p className="text-muted-foreground text-sm">
                View detailed info, photos, and reviews for each dorm
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <div className="flex justify-center mb-3">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Request a Spot</h3>
              <p className="text-muted-foreground text-sm">
                Submit your request and we'll connect you with the dorm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section Preview */}
      <section id="search" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Dorms</h2>
            <p className="text-muted-foreground">Explore verified student accommodations</p>
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
              View all dorms & filters
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section id="featured" className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose DormFinder?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <CheckCircle2 className="text-success mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Verified Listings</h3>
              <p className="text-sm text-muted-foreground">
                All dorms are verified for accuracy
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Search className="text-primary mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Smart Search</h3>
              <p className="text-sm text-muted-foreground">
                Filter by price, location, amenities
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Clock className="text-secondary mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Save Time</h3>
              <p className="text-sm text-muted-foreground">
                Compare all options in one place
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Building2 className="text-accent mx-auto mb-3" size={40} />
              <h3 className="font-semibold mb-2">Wide Selection</h3>
              <p className="text-sm text-muted-foreground">
                Dorms near all major universities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-lg px-4">
              <AccordionTrigger>How do I book a dorm?</AccordionTrigger>
              <AccordionContent>
                Browse available dorms, click "Request" on your preferred option, fill out the form with your details, and submit. We'll connect you with the dorm management.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Are all listings verified?</AccordionTrigger>
              <AccordionContent>
                Dorms marked with a "Verified" badge have been checked by our team. We're constantly working to verify all listings on the platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-lg px-4">
              <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
              <AccordionContent>
                Payment terms vary by dorm. After submitting a request, the dorm management will contact you with specific payment information and options.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Can I visit the dorm before booking?</AccordionTrigger>
              <AccordionContent>
                Yes! We recommend visiting dorms in person. After submitting a request, you can arrange a visit with the dorm management.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border rounded-lg px-4">
              <AccordionTrigger>Is this a real booking platform?</AccordionTrigger>
              <AccordionContent>
                This is a prototype demonstration with no backend. All data is stored locally in your browser. In a production version, requests would be sent to dorm managers.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground">
              Have questions? We're here to help!
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-card p-6 md:p-8 rounded-lg border border-border space-y-4">
            <div>
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Your name"
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
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="How can we help you?"
                rows={5}
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
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
