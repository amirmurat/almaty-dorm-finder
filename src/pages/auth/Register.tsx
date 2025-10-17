import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { register, createSession, validatePassword } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/tracking";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error || "";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!formData.agreed) {
      newErrors.agreed = "Необходимо согласие с правилами";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    setLoading(true);
    track("auth_register_attempt", { email: formData.email });

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone || undefined
      );

      if (!result.success) {
        track("auth_register_fail", { email: formData.email, error: result.error });
        toast.error(result.error || "Ошибка регистрации");
        setLoading(false);
        return;
      }

      if (result.user) {
        // Auto-login
        createSession(result.user.id);
        setUser(result.user);
        track("auth_register_success", { userId: result.user.id });
        toast.success("Регистрация прошла успешно!");
        navigate("/app/profile");
      }
    } catch (error) {
      track("auth_register_fail", { email: formData.email });
      toast.error("Произошла ошибка при регистрации");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
          <p className="text-muted-foreground">Создайте аккаунт для удобного управления заявками</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
          <div>
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Иван Иванов"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="phone">Телефон или Telegram (необязательно)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="@username или +7701..."
            />
          </div>

          <div>
            <Label htmlFor="password">Пароль *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Минимум 8 символов, 1 цифра"
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Повторите пароль"
            />
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreed"
              checked={formData.agreed}
              onCheckedChange={(checked) => setFormData({ ...formData, agreed: checked as boolean })}
            />
            <Label htmlFor="agreed" className="text-sm leading-tight cursor-pointer">
              Я согласен(на) с правилами использования сервиса *
            </Label>
          </div>
          {errors.agreed && <p className="text-xs text-destructive">{errors.agreed}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
