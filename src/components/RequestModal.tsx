import { useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dorm } from "@/data/dorms";
import { saveDormRequest, updateRequestPayment, Payment } from "@/lib/storage";
import { track } from "@/lib/tracking";
import { toast } from "sonner";
import { CheckoutModal } from "./CheckoutModal";
import { DEPOSIT_AMOUNT } from "@/lib/payment";

interface RequestModalProps {
  dorm: Dorm | null;
  open: boolean;
  onClose: () => void;
}

export function RequestModal({ dorm, open, onClose }: RequestModalProps) {
  const [step, setStep] = useState<"form" | "checkout" | "success">("form");
  const [requestId, setRequestId] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    university: "",
    contactType: "email" as "email" | "telegram",
    contactValue: "",
    roomType: "",
    budget: "",
    moveInMonth: "",
    consent: false,
    payDeposit: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    setStep("form");
    setFormData({
      fullName: "",
      university: "",
      contactType: "email",
      contactValue: "",
      roomType: "",
      budget: "",
      moveInMonth: "",
      consent: false,
      payDeposit: false
    });
    setErrors({});
    setRequestId("");
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.university) {
      newErrors.university = "University is required";
    }

    if (!formData.contactValue.trim()) {
      newErrors.contactValue = "Contact information is required";
    } else if (formData.contactType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactValue)) {
        newErrors.contactValue = "Invalid email format";
      }
    }

    if (!formData.roomType) {
      newErrors.roomType = "Room type is required";
    }

    if (!formData.budget || isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      newErrors.budget = "Valid budget is required";
    }

    if (!formData.moveInMonth) {
      newErrors.moveInMonth = "Move-in month is required";
    }

    if (!formData.consent) {
      newErrors.consent = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dorm) return;

    track("click_request", { dormId: dorm.id, dormName: dorm.name });

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const request = saveDormRequest({
        dormId: dorm.id,
        dormName: dorm.name,
        fullName: formData.fullName,
        university: formData.university,
        contactType: formData.contactType,
        contactValue: formData.contactValue,
        roomType: formData.roomType,
        budget: Number(formData.budget),
        moveInMonth: formData.moveInMonth
      });

      setRequestId(request.id);
      track("submit_request", { requestId: request.id, dormId: dorm.id });

      if (formData.payDeposit) {
        setStep("checkout");
      } else {
        track("success_confirm", { requestId: request.id });
        setStep("success");
        toast.success("Request submitted successfully!");
      }
    } catch (error) {
      toast.error("Failed to save request. Please try again.");
      console.error(error);
    }
  };

  const handlePaymentSuccess = (payment: Payment) => {
    updateRequestPayment(requestId, payment.id, "authorized");
    track("success_confirm", { requestId, paymentId: payment.id });
    setStep("success");
    toast.success("Request submitted with payment!");
  };

  if (!dorm) return null;

  return (
    <>
      <Dialog open={open && step !== "checkout"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {step === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle>Request / Join Waitlist</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Dorm</Label>
                  <Input value={dorm.name} disabled className="bg-muted" />
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <Label htmlFor="university">University *</Label>
                  <Select value={formData.university} onValueChange={(value) => setFormData({ ...formData, university: value })}>
                    <SelectTrigger id="university">
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KazNU">KazNU</SelectItem>
                      <SelectItem value="AITU">AITU</SelectItem>
                      <SelectItem value="Satbayev University">Satbayev University</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.university && <p className="text-xs text-destructive mt-1">{errors.university}</p>}
                </div>

                <div>
                  <Label>Contact Type *</Label>
                  <Select value={formData.contactType} onValueChange={(value: "email" | "telegram") => setFormData({ ...formData, contactType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contactValue">
                    {formData.contactType === "email" ? "Email Address *" : "Telegram Username *"}
                  </Label>
                  <Input
                    id="contactValue"
                    value={formData.contactValue}
                    onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                    placeholder={formData.contactType === "email" ? "your@email.com" : "@username"}
                  />
                  {errors.contactValue && <p className="text-xs text-destructive mt-1">{errors.contactValue}</p>}
                </div>

                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select value={formData.roomType} onValueChange={(value) => setFormData({ ...formData, roomType: value })}>
                    <SelectTrigger id="roomType">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dorm.roomTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.roomType && <p className="text-xs text-destructive mt-1">{errors.roomType}</p>}
                </div>

                <div>
                  <Label htmlFor="budget">Budget (KZT) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. 60000"
                  />
                  {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget}</p>}
                </div>

                <div>
                  <Label htmlFor="moveInMonth">Move-in Month *</Label>
                  <Select value={formData.moveInMonth} onValueChange={(value) => setFormData({ ...formData, moveInMonth: value })}>
                    <SelectTrigger id="moveInMonth">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.moveInMonth && <p className="text-xs text-destructive mt-1">{errors.moveInMonth}</p>}
                </div>

                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="payDeposit"
                      checked={formData.payDeposit}
                      onCheckedChange={(checked) => setFormData({ ...formData, payDeposit: checked as boolean })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="payDeposit" className="text-sm font-medium cursor-pointer">
                        Pay reservation deposit now
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Secure your spot with a {DEPOSIT_AMOUNT.toLocaleString()} ₸ deposit
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                  />
                  <Label htmlFor="consent" className="text-sm leading-tight cursor-pointer">
                    I consent to be contacted and agree to the terms of service *
                  </Label>
                </div>
                {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {formData.payDeposit ? "Continue to Payment" : "Submit Request"}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-success" size={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground mb-4">
                Request #{requestId} saved locally
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                We'll contact you by {formData.contactType === "email" ? "email" : "Telegram"}
              </p>
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CheckoutModal
        open={step === "checkout"}
        onClose={() => {
          setStep("success");
          toast.success("Request submitted without payment");
        }}
        onSuccess={handlePaymentSuccess}
        requestId={requestId}
      />
    </>
  );
}
