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
  paymentId?: string;
  paymentStatus?: "authorized" | "refunded";
}

export interface Payment {
  id: string;
  requestId: string;
  amount: number;
  method: "PaymentRequest" | "MockCard";
  timestamp: string;
  status: "authorized" | "refunded";
  cardLast4?: string;
}

const REQUESTS_KEY = "dormRequests";
const PAYMENTS_KEY = "payments";

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

export function savePayment(payment: Omit<Payment, "id" | "timestamp">): Payment {
  const newPayment: Payment = {
    ...payment,
    id: generateShortId(),
    timestamp: new Date().toISOString()
  };
  
  try {
    const existing = localStorage.getItem(PAYMENTS_KEY);
    const payments: Payment[] = existing ? JSON.parse(existing) : [];
    payments.push(newPayment);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    return newPayment;
  } catch (error) {
    console.error("Failed to save payment:", error);
    throw error;
  }
}

export function getPayments(): Payment[] {
  try {
    const existing = localStorage.getItem(PAYMENTS_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error("Failed to read payments:", error);
    return [];
  }
}

export function updatePaymentStatus(paymentId: string, status: "authorized" | "refunded"): void {
  try {
    const payments = getPayments();
    const updated = payments.map(p => p.id === paymentId ? { ...p, status } : p);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update payment:", error);
    throw error;
  }
}

export function updateRequestPayment(requestId: string, paymentId: string, status: "authorized" | "refunded"): void {
  try {
    const requests = getDormRequests();
    const updated = requests.map(r => 
      r.id === requestId ? { ...r, paymentId, paymentStatus: status } : r
    );
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update request payment:", error);
    throw error;
  }
}
