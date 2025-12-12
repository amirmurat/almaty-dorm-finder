import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventLog, clearEventLog, TrackingEvent } from "@/lib/tracking";
import { getOnboardingProfile, getDormRequests, getDemoPayments } from "@/lib/storage";
import { getUsers } from "@/lib/auth";
import { toast } from "sonner";

interface DebugModalProps {
  open: boolean;
  onClose: () => void;
}

export function DebugModal({ open, onClose }: DebugModalProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadAllData();
    }
  }, [open]);

  const loadAllData = async () => {
    setEvents(getEventLog());
    setOnboardingData(getOnboardingProfile());
    setRequests(await getDormRequests());
    setPayments(await getDemoPayments());
    // Don't show passwords
    const allUsers = getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt
    }));
    setUsers(allUsers);
  };

  const handleClearEvents = () => {
    clearEventLog();
    setEvents([]);
    toast.success("Лог событий очищен");
  };

  const handleClearAll = () => {
    if (confirm("Очистить ВСЕ данные localStorage? Это действие необратимо.")) {
      localStorage.clear();
      loadAllData();
      toast.success("Все данные очищены");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🔧 Debug — Данные localStorage</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="onboarding" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="onboarding">Опрос</TabsTrigger>
            <TabsTrigger value="requests">Заявки</TabsTrigger>
            <TabsTrigger value="payments">Платежи</TabsTrigger>
            <TabsTrigger value="users">Юзеры</TabsTrigger>
            <TabsTrigger value="events">События</TabsTrigger>
          </TabsList>

          <TabsContent value="onboarding" className="space-y-4">
            <h3 className="font-semibold">Результаты опросника</h3>
            {onboardingData ? (
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(onboardingData, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">Опросник не пройден</p>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <h3 className="font-semibold">Заявки на общежития ({requests.length})</h3>
            {requests.length === 0 ? (
              <p className="text-muted-foreground">Заявок нет</p>
            ) : (
              <div className="space-y-2">
                {requests.map((req, i) => (
                  <details key={i} className="bg-muted p-3 rounded-lg">
                    <summary className="cursor-pointer font-medium">
                      {req.dormName} — {req.fullName}
                    </summary>
                    <pre className="text-xs mt-2 overflow-x-auto">
                      {JSON.stringify(req, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <h3 className="font-semibold">Демо-платежи ({payments.length})</h3>
            {payments.length === 0 ? (
              <p className="text-muted-foreground">Платежей нет</p>
            ) : (
              <div className="space-y-2">
                {payments.map((pay, i) => (
                  <details key={i} className="bg-muted p-3 rounded-lg">
                    <summary className="cursor-pointer font-medium">
                      {pay.dormName} — {pay.amount} ₸ ({pay.status})
                    </summary>
                    <pre className="text-xs mt-2 overflow-x-auto">
                      {JSON.stringify(pay, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <h3 className="font-semibold">Пользователи ({users.length})</h3>
            {users.length === 0 ? (
              <p className="text-muted-foreground">Пользователей нет</p>
            ) : (
              <div className="space-y-2">
                {users.map((user, i) => (
                  <details key={i} className="bg-muted p-3 rounded-lg">
                    <summary className="cursor-pointer font-medium">
                      {user.name} — {user.email}
                    </summary>
                    <pre className="text-xs mt-2 overflow-x-auto">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <h3 className="font-semibold">Лог событий ({events.length})</h3>
            {events.length === 0 ? (
              <p className="text-muted-foreground">События не логировались</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Время</th>
                      <th className="text-left p-2">Событие</th>
                      <th className="text-left p-2">Данные</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-2 font-mono text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-2 font-medium">{event.event}</td>
                        <td className="p-2 font-mono text-xs max-w-md truncate">
                          {JSON.stringify(event.payload)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Button variant="destructive" size="sm" onClick={handleClearEvents} disabled={events.length === 0}>
              Очистить лог событий
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button variant="destructive" onClick={handleClearAll}>
            Очистить ВСЕ данные
          </Button>
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
