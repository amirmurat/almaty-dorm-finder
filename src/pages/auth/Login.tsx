import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login, createSession } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/tracking";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);
    track("auth_login_attempt", { email: formData.email });

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        track("auth_login_fail", { email: formData.email, error: result.error });
        toast.error(result.error || "Ошибка входа");
        setLoading(false);
        return;
      }

      if (result.user) {
        createSession(result.user.id);
        setUser(result.user);
        track("auth_login_success", { userId: result.user.id });
        toast.success("Вы успешно вошли в систему");
        
        // Redirect to previous page or profile
        const from = (location.state as any)?.from?.pathname || "/app/profile";
        navigate(from, { replace: true });
      }
    } catch (error) {
      track("auth_login_fail", { email: formData.email });
      toast.error("Произошла ошибка при входе");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Вход</h1>
          <p className="text-muted-foreground">Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Введите пароль"
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.remember}
                onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Запомнить меня
              </Label>
            </div>
            <Link to="/auth/reset" className="text-sm text-primary hover:underline">
              Забыли пароль?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link to="/auth/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
