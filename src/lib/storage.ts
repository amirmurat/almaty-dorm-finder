export interface DormRequest {
  id: string;
  dormId: string;
  dormName: string;
  fullName: string;
  university: string;
  contactType: "email" | "telegram";
  contactValue: string;
  roomType: string;
  budget: number;
  moveInMonth: string;
  timestamp: string;
  demoPaymentId?: string;
  userId?: string;
}

export interface DemoPayment {
  id: string;
  requestId?: string;
  dormId: string;
  dormName: string;
  amount: number;
  status: "success" | "declined";
  timestamp: string;
}

const REQUESTS_KEY = "dormRequests";
const DEMO_PAYMENTS_KEY = "demoPayments";

export function saveDormRequest(request: Omit<DormRequest, "id" | "timestamp">): DormRequest {
  const newRequest: DormRequest = {
    ...request,
    id: generateShortId(),
    timestamp: new Date().toISOString()
  };
  
  try {
    const existing = localStorage.getItem(REQUESTS_KEY);
    const requests: DormRequest[] = existing ? JSON.parse(existing) : [];
    requests.push(newRequest);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    return newRequest;
  } catch (error) {
    console.error("Failed to save request:", error);
    throw error;
  }
}

export function getDormRequests(): DormRequest[] {
  try {
    const existing = localStorage.getItem(REQUESTS_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error("Failed to read requests:", error);
    return [];
  }
}

export function deleteDormRequest(id: string): void {
  try {
    const requests = getDormRequests();
    const filtered = requests.filter(r => r.id !== id);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete request:", error);
    throw error;
  }
}

function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function saveDemoPayment(payment: Omit<DemoPayment, "id" | "timestamp">): DemoPayment {
  const newPayment: DemoPayment = {
    ...payment,
    id: "DEMO-" + generateShortId(),
    timestamp: new Date().toISOString()
  };
  
  try {
    const existing = localStorage.getItem(DEMO_PAYMENTS_KEY);
    const payments: DemoPayment[] = existing ? JSON.parse(existing) : [];
    payments.push(newPayment);
    localStorage.setItem(DEMO_PAYMENTS_KEY, JSON.stringify(payments));
    return newPayment;
  } catch (error) {
    console.error("Failed to save demo payment:", error);
    throw error;
  }
}

export function getDemoPayments(): DemoPayment[] {
  try {
    const existing = localStorage.getItem(DEMO_PAYMENTS_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error("Failed to read demo payments:", error);
    return [];
  }
}

export function getDemoPaymentByRequestId(requestId: string): DemoPayment | undefined {
  const payments = getDemoPayments();
  return payments.find(p => p.requestId === requestId);
}

export interface OnboardingProfile {
  role: string;
  roleOther?: string;
  university: string;
  liveNow: boolean;
  moveIn: string;
  budgetMin: number;
  budgetMax: number;
  genderPolicy: string;
  roomType: string;
  transparencyScore: number;
  depositWilling: string;
  source: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
  contact?: string;
  timestamp: string;
}

export interface OnboardingStatus {
  status: "submitted" | "skipped";
  nextAt?: string; // ISO date when to show again
}

const ONBOARDING_PROFILE_KEY = "onboardingProfile";
const ONBOARDING_STATUS_KEY = "onboardingStatus";

export function saveOnboardingProfile(profile: Omit<OnboardingProfile, "timestamp">): OnboardingProfile {
  const newProfile: OnboardingProfile = {
    ...profile,
    timestamp: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(newProfile));
    return newProfile;
  } catch (error) {
    console.error("Failed to save onboarding profile:", error);
    throw error;
  }
}

export function getOnboardingProfile(): OnboardingProfile | null {
  try {
    const existing = localStorage.getItem(ONBOARDING_PROFILE_KEY);
    return existing ? JSON.parse(existing) : null;
  } catch (error) {
    console.error("Failed to read onboarding profile:", error);
    return null;
  }
}

export function saveOnboardingStatus(status: OnboardingStatus): void {
  try {
    localStorage.setItem(ONBOARDING_STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.error("Failed to save onboarding status:", error);
  }
}

export function getOnboardingStatus(): OnboardingStatus | null {
  try {
    const existing = localStorage.getItem(ONBOARDING_STATUS_KEY);
    return existing ? JSON.parse(existing) : null;
  } catch (error) {
    console.error("Failed to read onboarding status:", error);
    return null;
  }
}

export function shouldShowOnboarding(): boolean {
  const status = getOnboardingStatus();
  
  if (!status) return true; // First time visitor
  
  if (status.status === "submitted") return false; // Already submitted
  
  if (status.status === "skipped" && status.nextAt) {
    const nextDate = new Date(status.nextAt);
    return new Date() >= nextDate; // Show again if 30 days passed
  }
  
  return true;
}
