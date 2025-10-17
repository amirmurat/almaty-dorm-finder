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
