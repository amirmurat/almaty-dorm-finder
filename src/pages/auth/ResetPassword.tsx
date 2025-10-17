import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { resetPassword, validatePassword, getUsers } from "@/lib/auth";
import { track } from "@/lib/tracking";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "Email обязателен" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Неверный формат email" });
      return;
    }

    // Check if user exists
    const users = getUsers();
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userExists) {
      setErrors({ email: "Пользователь с таким email не найден" });
      return;
    }

    // Generate demo code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setErrors({});
    setStep("code");
    track("auth_reset_start", { email });
    toast.info(`Ваш демо-код: ${code}`);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (demoCode !== generatedCode) {
      newErrors.code = "Неверный код";
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error || "";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email, newPassword);

      if (!result.success) {
        track("auth_reset_fail", { email, error: result.error });
        toast.error(result.error || "Ошибка сброса пароля");
        setLoading(false);
        return;
      }

      track("auth_reset_success", { email });
      toast.success("Пароль успешно изменен!");
      setStep("success");
    } catch (error) {
      track("auth_reset_fail", { email });
      toast.error("Произошла ошибка");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Сброс пароля</h1>
          <p className="text-muted-foreground">Восстановите доступ к своему аккаунту</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="bg-muted p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Это демо-версия. Код для сброса будет показан на экране.
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <Button type="submit" className="w-full">
                Продолжить
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/auth/login" className="text-primary hover:underline">
                  Назад к входу
                </Link>
              </div>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="bg-primary/10 border border-primary rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Ваш демо-код:</p>
                <Badge className="text-xl py-2 px-4">{generatedCode}</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Введите этот код ниже
                </p>
              </div>

              <div>
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  value={demoCode}
                  onChange={(e) => setDemoCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
              </div>

              <div>
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 8 символов, 1 цифра"
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Сохранение..." : "Изменить пароль"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-primary hover:underline"
                >
                  Изменить email
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-4 py-4">
              <div className="text-success text-6xl mb-4">✓</div>
              <h3 className="text-xl font-semibold">Пароль изменен!</h3>
              <p className="text-muted-foreground">
                Теперь вы можете войти с новым паролем
              </p>
              <Button onClick={() => navigate("/auth/login")} className="w-full">
                Перейти к входу
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
