import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getEventLog, clearEventLog, TrackingEvent } from "@/lib/tracking";
import { toast } from "sonner";

interface DebugModalProps {
  open: boolean;
  onClose: () => void;
}

export function DebugModal({ open, onClose }: DebugModalProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    if (open) {
      loadEvents();
    }
  }, [open]);

  const loadEvents = () => {
    const log = getEventLog();
    setEvents(log);
  };

  const handleClear = () => {
    clearEventLog();
    setEvents([]);
    toast.success("Event log cleared");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Debug - Event Log</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No events logged yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">Event</th>
                    <th className="text-left p-2">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="p-2 font-mono text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2 font-medium">{event.event}</td>
                      <td className="p-2 font-mono text-xs">
                        {JSON.stringify(event.payload)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="destructive" onClick={handleClear} disabled={events.length === 0}>
            Clear Log
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
