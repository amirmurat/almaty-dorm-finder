import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  saveOnboardingProfile, 
  saveOnboardingStatus, 
  getOnboardingProfile,
  OnboardingProfile 
} from "@/lib/storage";
import { track } from "@/lib/tracking";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
}

export function OnboardingModal({ open, onClose, isEdit = false }: OnboardingModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1
  const [role, setRole] = useState("");
  const [roleOther, setRoleOther] = useState("");
  const [university, setUniversity] = useState("");
  const [liveNow, setLiveNow] = useState<boolean | null>(null);
  
  // Step 2
  const [moveIn, setMoveIn] = useState("");
  const [budget, setBudget] = useState([40000, 120000]);
  const [genderPolicy, setGenderPolicy] = useState("");
  const [roomType, setRoomType] = useState("");
  
  // Step 3
  const [transparencyScore, setTransparencyScore] = useState([3]);
  const [depositWilling, setDepositWilling] = useState("");
  const [source, setSource] = useState("");
  const [contact, setContact] = useState("");
  const [dataConsent, setDataConsent] = useState(false);

  // Load existing profile if editing
  useEffect(() => {
    if (isEdit && open) {
      const existing = getOnboardingProfile();
      if (existing) {
        setRole(existing.role);
        setRoleOther(existing.roleOther || "");
        setUniversity(existing.university);
        setLiveNow(existing.liveNow);
        setMoveIn(existing.moveIn);
        setBudget([existing.budgetMin, existing.budgetMax]);
        setGenderPolicy(existing.genderPolicy);
        setRoomType(existing.roomType);
        setTransparencyScore([existing.transparencyScore]);
        setDepositWilling(existing.depositWilling);
        setSource(existing.source);
        setContact(existing.contact || "");
        setDataConsent(true);
      }
    }
  }, [isEdit, open]);

  // Track opening
  useEffect(() => {
    if (open) {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source");
      const utmMedium = urlParams.get("utm_medium");
      const utmCampaign = urlParams.get("utm_campaign");
      const utmContent = urlParams.get("utm_content");
      
      const utm = {
        source: utmSource || undefined,
        medium: utmMedium || undefined,
        campaign: utmCampaign || undefined,
        content: utmContent || undefined
      };
      
      track(isEdit ? "onboarding_edit_open" : "onboarding_open", { 
        utm: (utmSource || utmMedium || utmCampaign || utmContent) ? utm : undefined,
        referrer: document.referrer 
      });
    }
  }, [open, isEdit]);

  const handleSkip = () => {
    const nextAt = new Date();
    nextAt.setDate(nextAt.getDate() + 30);
    
    saveOnboardingStatus({
      status: "skipped",
      nextAt: nextAt.toISOString()
    });
    
    track("onboarding_skip", {});
    toast.info("Опрос пропущен — можно вернуться в Профиле");
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      if (!role || !university || liveNow === null) {
        toast.error("Заполните обязательные поля");
        return;
      }
    } else if (step === 2) {
      if (!moveIn || !genderPolicy || !roomType) {
        toast.error("Заполните обязательные поля");
        return;
      }
    }
    
    track("onboarding_next_step", { step: step + 1 });
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!depositWilling || !source) {
      toast.error("Заполните обязательные поля");
      return;
    }

    if (contact && !validateContact(contact)) {
      toast.error("Некорректный формат email или Telegram");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const utmMedium = urlParams.get("utm_medium");
    const utmCampaign = urlParams.get("utm_campaign");
    const utmContent = urlParams.get("utm_content");
    
    const utm = {
      source: utmSource || undefined,
      medium: utmMedium || undefined,
      campaign: utmCampaign || undefined,
      content: utmContent || undefined
    };

    const profile: Omit<OnboardingProfile, "timestamp"> = {
      role,
      roleOther: role === "Другое" ? roleOther : undefined,
      university,
      liveNow: liveNow!,
      moveIn,
      budgetMin: budget[0],
      budgetMax: budget[1],
      genderPolicy,
      roomType,
      transparencyScore: transparencyScore[0],
      depositWilling,
      source,
      utm: (utm.source || utm.medium || utm.campaign || utm.content) ? utm : undefined,
      contact: contact || undefined
    };

    saveOnboardingProfile(profile);
    saveOnboardingStatus({ status: "submitted" });
    
    track(isEdit ? "onboarding_edit_save" : "onboarding_submit", {
      role,
      university,
      budgetBand: `${budget[0]}-${budget[1]}`,
      moveInMonth: moveIn,
      genderPolicy,
      roomType,
      depositWilling
    });

    toast.success("Настройки сохранены");
    
    // Apply filters and navigate to dorms page
    if (!isEdit) {
      const params = new URLSearchParams();
      params.set("university", university);
      params.set("priceMin", budget[0].toString());
      params.set("priceMax", budget[1].toString());
      params.set("gender", genderPolicy);
      params.set("roomType", roomType);
      navigate(`/dorms?${params.toString()}`);
    }
    
    onClose();
  };

  const validateContact = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telegramRegex = /^@[\w]+$/;
    return emailRegex.test(value) || telegramRegex.test(value);
  };

  const progress = (step / 3) * 100;

  const universities = [
    "KazNU",
    "Satbayev University",
    "AITU",
    "AlmaU",
    "KBTU",
    "Другое"
  ];

  const moveInOptions = [
    "Октябрь 2025",
    "Ноябрь 2025",
    "Декабрь 2025",
    "Январь 2026",
    "Февраль 2026",
    "Март 2026",
    "Апрель 2026",
    "Май 2026"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Закрыть</span>
        </button>

        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Изменить ответы опроса" : "Кто вы и что ищете?"}
          </DialogTitle>
          <DialogDescription>
            {!isEdit && "Это займёт 15 секунд. Можно пропустить."}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Кто вы? *</Label>
              <RadioGroup value={role} onValueChange={setRole} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Первокурсник" id="role1" />
                  <Label htmlFor="role1" className="font-normal cursor-pointer">Первокурсник</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Студент 2–4 курса" id="role2" />
                  <Label htmlFor="role2" className="font-normal cursor-pointer">Студент 2–4 курса</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Магистрант" id="role3" />
                  <Label htmlFor="role3" className="font-normal cursor-pointer">Магистрант</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Родитель/опекун" id="role4" />
                  <Label htmlFor="role4" className="font-normal cursor-pointer">Родитель/опекун</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Представитель общежития" id="role5" />
                  <Label htmlFor="role5" className="font-normal cursor-pointer">Представитель общежития</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Другое" id="role6" />
                  <Label htmlFor="role6" className="font-normal cursor-pointer">Другое</Label>
                </div>
              </RadioGroup>
              {role === "Другое" && (
                <Input
                  value={roleOther}
                  onChange={(e) => setRoleOther(e.target.value)}
                  placeholder="Укажите вашу роль"
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label htmlFor="university">Университет *</Label>
              <Select value={university} onValueChange={setUniversity}>
                <SelectTrigger id="university">
                  <SelectValue placeholder="Выберите ваш вуз" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(uni => (
                    <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Сейчас живёте в общежитии? *</Label>
              <RadioGroup 
                value={liveNow === null ? "" : liveNow ? "yes" : "no"} 
                onValueChange={(v) => setLiveNow(v === "yes")}
                className="mt-2 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="live-yes" />
                  <Label htmlFor="live-yes" className="font-normal cursor-pointer">Да</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="live-no" />
                  <Label htmlFor="live-no" className="font-normal cursor-pointer">Нет</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="moveIn">Когда планируете въезд? *</Label>
              <Select value={moveIn} onValueChange={setMoveIn}>
                <SelectTrigger id="moveIn">
                  <SelectValue placeholder="Выберите месяц" />
                </SelectTrigger>
                <SelectContent>
                  {moveInOptions.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Бюджет за месяц: {budget[0].toLocaleString()} – {budget[1].toLocaleString()}+ ₸</Label>
              <Slider
                value={budget}
                onValueChange={setBudget}
                min={40000}
                max={120000}
                step={10000}
                className="mt-3"
              />
            </div>

            <div>
              <Label>Предпочтение по проживанию *</Label>
              <RadioGroup value={genderPolicy} onValueChange={setGenderPolicy} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="gender1" />
                  <Label htmlFor="gender1" className="font-normal cursor-pointer">Мужское</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="gender2" />
                  <Label htmlFor="gender2" className="font-normal cursor-pointer">Женское</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="gender3" />
                  <Label htmlFor="gender3" className="font-normal cursor-pointer">Совместное</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="gender4" />
                  <Label htmlFor="gender4" className="font-normal cursor-pointer">Не важно</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="roomType">Тип комнаты *</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger id="roomType">
                  <SelectValue placeholder="Выберите тип комнаты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Одиночная">Одиночная</SelectItem>
                  <SelectItem value="2-местная">2-местная</SelectItem>
                  <SelectItem value="4-местная">4-местная</SelectItem>
                  <SelectItem value="Не важно">Не важно</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Насколько важна прозрачность наличия мест? (1-5)</Label>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-muted-foreground">1</span>
                <Slider
                  value={transparencyScore}
                  onValueChange={setTransparencyScore}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">5</span>
                <span className="font-semibold w-8 text-center">{transparencyScore[0]}</span>
              </div>
            </div>

            <div>
              <Label>Готовность оставить депозит *</Label>
              <RadioGroup value={depositWilling} onValueChange={setDepositWilling} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Да" id="deposit1" />
                  <Label htmlFor="deposit1" className="font-normal cursor-pointer">Да</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Нет" id="deposit2" />
                  <Label htmlFor="deposit2" className="font-normal cursor-pointer">Нет</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Не уверен" id="deposit3" />
                  <Label htmlFor="deposit3" className="font-normal cursor-pointer">Не уверен</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="source">Откуда узнали о нас? *</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Выберите источник" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Друзья/чат">Друзья/чат</SelectItem>
                  <SelectItem value="Поиск">Поиск</SelectItem>
                  <SelectItem value="Соцсети">Соцсети</SelectItem>
                  <SelectItem value="Общежитие">Общежитие</SelectItem>
                  <SelectItem value="Другое">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact">Контакт (опционально)</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@example.com или @username"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={dataConsent}
                onCheckedChange={(checked) => setDataConsent(checked as boolean)}
              />
              <Label htmlFor="consent" className="font-normal text-sm cursor-pointer">
                Согласен(на) с обработкой данных (локально)
              </Label>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {step > 1 && (
              <Button onClick={handleBack} variant="outline" size="sm">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Назад
              </Button>
            )}
            {!isEdit && (
              <Button onClick={handleSkip} variant="ghost" size="sm">
                Пропустить
              </Button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <Button onClick={handleNext} size="sm">
                Далее
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                size="sm"
                disabled={step === 3 && !dataConsent}
              >
                Сохранить
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}