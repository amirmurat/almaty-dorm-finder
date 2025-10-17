import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventLog, clearEventLog, TrackingEvent } from "@/lib/tracking";
import { getPayments, Payment } from "@/lib/storage";
import { toast } from "sonner";

interface DebugModalProps {
  open: boolean;
  onClose: () => void;
}

export function DebugModal({ open, onClose }: DebugModalProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = () => {
    const log = getEventLog();
    const paymentData = getPayments();
    setEvents(log);
    setPayments(paymentData);
  };

  const handleClear = () => {
    clearEventLog();
    setEvents([]);
    toast.success("Event log cleared");
  };

  const handleExport = () => {
    const data = {
      eventLog: events,
      payments: payments,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Debug data exported");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Debug Console</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Event Log ({events.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-4">
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
                        <td className="p-2 font-mono text-xs overflow-hidden text-ellipsis max-w-xs">
                          {JSON.stringify(event.payload)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {payments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No payments recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Request ID</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Method</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border">
                        <td className="p-2 font-mono text-xs">#{payment.id}</td>
                        <td className="p-2 font-mono text-xs">#{payment.requestId}</td>
                        <td className="p-2">{payment.amount.toLocaleString()} ₸</td>
                        <td className="p-2">{payment.method}</td>
                        <td className="p-2">
                          <span className={payment.status === "authorized" ? "text-success" : "text-muted-foreground"}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-xs">
                          {new Date(payment.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-between pt-4">
          <Button variant="outline" onClick={handleExport} disabled={events.length === 0 && payments.length === 0}>
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleClear} disabled={events.length === 0}>
              Clear Log
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
