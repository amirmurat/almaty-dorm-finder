export interface TrackingEvent {
  timestamp: string;
  event: string;
  payload: Record<string, unknown>;
}

const EVENT_LOG_KEY = "eventLog";

export function track(eventName: string, payload: Record<string, unknown> = {}) {
  const event: TrackingEvent = {
    timestamp: new Date().toISOString(),
    event: eventName,
    payload
  };
  
  // Don't log sensitive data
  const sanitizedPayload = { ...payload };
  if ('password' in sanitizedPayload) delete sanitizedPayload.password;
  if ('passwordHash' in sanitizedPayload) delete sanitizedPayload.passwordHash;
  
  console.log("📊 Event:", eventName, sanitizedPayload);
  
  try {
    const existing = localStorage.getItem(EVENT_LOG_KEY);
    const log: TrackingEvent[] = existing ? JSON.parse(existing) : [];
    log.push(event);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(log));
  } catch (error) {
    console.error("Failed to save event to localStorage:", error);
  }
}

export function getEventLog(): TrackingEvent[] {
  try {
    const existing = localStorage.getItem(EVENT_LOG_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error("Failed to read event log:", error);
    return [];
  }
}

export function clearEventLog() {
  try {
    localStorage.removeItem(EVENT_LOG_KEY);
  } catch (error) {
    console.error("Failed to clear event log:", error);
  }
}
