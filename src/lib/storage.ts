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
}

const REQUESTS_KEY = "dormRequests";

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
