import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Bug } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MyRequestsModal } from "./MyRequestsModal";
import { DebugModal } from "./DebugModal";
import { OnboardingModal } from "./OnboardingModal";
import { Button } from "./ui/button";
import { shouldShowOnboarding } from "@/lib/storage";

export function Layout() {
  const [myRequestsOpen, setMyRequestsOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    // Show onboarding after 400ms if needed
    const timer = setTimeout(() => {
      if (shouldShowOnboarding()) {
        setOnboardingOpen(true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMyRequestsClick={() => setMyRequestsOpen(true)} />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />

      <MyRequestsModal
        open={myRequestsOpen}
        onClose={() => setMyRequestsOpen(false)}
      />

      <DebugModal
        open={debugOpen}
        onClose={() => setDebugOpen(false)}
      />

      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      {/* Debug Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDebugOpen(true)}
        className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
        title="Debug"
      >
        <Bug size={16} />
      </Button>
    </div>
  );
}
