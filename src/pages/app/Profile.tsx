import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getDormRequests, DormRequest, deleteDormRequest } from "@/lib/storage";
import { deleteUser } from "@/lib/auth";
import { track } from "@/lib/tracking";
import { toast } from "sonner";
import { User, LogOut, Trash2, Mail, Phone, Edit } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<DormRequest[]>([]);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    loadRequests();
  }, [isAuthenticated, navigate]);

  const loadRequests = () => {
    if (!user) return;
    const allRequests = getDormRequests();
    // Filter requests by user if userId was saved
    // For now, show all requests since we didn't add userId to old requests
    setRequests(allRequests);
  };

  const handleLogout = () => {
    logout();
    track("auth_logout", { userId: user?.id });
    toast.success("Вы вышли из аккаунта");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    
    try {
      deleteUser(user.id);
      logout();
      track("user_delete_account", { userId: user.id });
      toast.success("Аккаунт удален");
      navigate("/");
    } catch (error) {
      toast.error("Ошибка удаления аккаунта");
      console.error(error);
    }
  };

  const handleDeleteRequest = (id: string) => {
    try {
      deleteDormRequest(id);
      track("delete_request", { requestId: id });
      toast.success("Заявка удалена");
      loadRequests();
      setDeleteRequestId(null);
    } catch (error) {
      toast.error("Ошибка удаления заявки");
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Здравствуйте, {user.name}!</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </div>

        {/* Onboarding Settings */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Настройки поиска</h2>
            <Button onClick={() => setOnboardingOpen(true)} variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Изменить ответы опроса
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Измените ваши предпочтения для более точного поиска общежитий
          </p>
        </div>

        {/* My Requests */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Мои заявки</h2>
          
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>У вас пока нет заявок</p>
              <Button onClick={() => navigate("/dorms")} variant="outline" className="mt-4">
                Найти общежитие
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{request.dormName}</h4>
                      <p className="text-sm text-muted-foreground">Заявка #{request.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.demoPaymentId && (
                        <Badge variant="secondary" className="text-xs">
                          Оплачено (демо)
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteRequestId(request.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Имя:</span> {request.fullName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Университет:</span> {request.university}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Контакт:</span> {request.contactValue}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Комната:</span> {request.roomType}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Бюджет:</span> {request.budget.toLocaleString()} ₸
                    </div>
                    <div>
                      <span className="text-muted-foreground">Заселение:</span> {request.moveInMonth}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Отправлено: {new Date(request.timestamp).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-destructive">Опасная зона</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Удаление аккаунта необратимо. Все ваши данные будут удалены.
          </p>
          <Button
            onClick={() => setDeleteAccountOpen(true)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить аккаунт
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все ваши данные и заявки будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Request Confirmation */}
      <AlertDialog open={!!deleteRequestId} onOpenChange={(open) => !open && setDeleteRequestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRequestId && handleDeleteRequest(deleteRequestId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Onboarding Modal */}
      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        isEdit={true}
      />
    </div>
  );
}
