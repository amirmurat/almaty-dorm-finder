import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { saveDemoPayment, DemoPayment, getDormRequests, saveDormRequest } from "@/lib/storage";
import { Dorm } from "@/data/dorms";
import { track } from "@/lib/tracking";

interface DemoCheckoutProps {
  open: boolean;
  onClose: () => void;
  dorm: Dorm;
  requestId?: string;
  onSuccess?: (payment: DemoPayment) => void;
}

const DEMO_DEPOSIT_AMOUNT = 10000;

export function DemoCheckout({ open, onClose, dorm, requestId, onSuccess }: DemoCheckoutProps) {
  const [step, setStep] = useState<"form" | "processing" | "success" | "declined">("form");
  const [payment, setPayment] = useState<DemoPayment | null>(null);

  // Form state
  const [payerName, setPayerName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!payerName.trim()) {
      newErrors.payerName = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!cardNumber.replace(/\s/g, "")) {
      newErrors.cardNumber = "Card number is required";
    } else if (cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!expiry) {
      newErrors.expiry = "Expiry is required";
    } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Format: MM/YY";
    }

    if (!cvc) {
      newErrors.cvc = "CVC is required";
    } else if (!/^\d{3}$/.test(cvc)) {
      newErrors.cvc = "CVC must be 3 digits";
    }

    if (!agreed) {
      newErrors.agreed = "You must agree to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      setExpiry(digits.substring(0, 2) + "/" + digits.substring(2, 4));
    } else {
      setExpiry(digits);
    }
  };

  const handleCvcChange = (value: string) => {
    setCvc(value.replace(/\D/g, "").substring(0, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    track("submit_checkout_demo", { dormId: dorm.id, requestId });
    setStep("processing");

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Random 10-15% chance of decline
    const shouldDecline = Math.random() < 0.125;

    if (shouldDecline) {
      setStep("declined");
      track("mock_pay_decline", { dormId: dorm.id, requestId });
    } else {
      // Save payment (without card details)
      const newPayment = saveDemoPayment({
        requestId,
        dormId: dorm.id,
        dormName: dorm.name,
        amount: DEMO_DEPOSIT_AMOUNT,
        status: "success"
      });

      // Update request if exists
      if (requestId) {
        const requests = getDormRequests();
        const request = requests.find(r => r.id === requestId);
        if (request) {
          request.demoPaymentId = newPayment.id;
          saveDormRequest(request);
        }
      }

      setPayment(newPayment);
      setStep("success");
      track("mock_pay_success", { dormId: dorm.id, paymentId: newPayment.id, requestId });
      onSuccess?.(newPayment);
    }
  };

  const handleReset = () => {
    setStep("form");
    setErrors({});
  };

  const handleClose = () => {
    setStep("form");
    setPayerName("");
    setEmail("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setAgreed(false);
    setErrors({});
    setPayment(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "form" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Demo Payment</DialogTitle>
                <Badge variant="secondary" className="text-xs">
                  DEMO • No Real Charges
                </Badge>
              </div>
              <DialogDescription>
                Reservation deposit for {dorm.name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="payerName">Full Name *</Label>
                <Input
                  id="payerName"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="John Doe"
                  aria-invalid={!!errors.payerName}
                  aria-describedby={errors.payerName ? "payerName-error" : undefined}
                />
                {errors.payerName && (
                  <p id="payerName-error" className="text-sm text-destructive mt-1">
                    {errors.payerName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  value={`${DEMO_DEPOSIT_AMOUNT.toLocaleString()} ₸`}
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Reservation deposit amount (fixed)
                </p>
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  aria-invalid={!!errors.cardNumber}
                  aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
                />
                {errors.cardNumber && (
                  <p id="cardNumber-error" className="text-sm text-destructive mt-1">
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry *</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    aria-invalid={!!errors.expiry}
                    aria-describedby={errors.expiry ? "expiry-error" : undefined}
                  />
                  {errors.expiry && (
                    <p id="expiry-error" className="text-sm text-destructive mt-1">
                      {errors.expiry}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cvc">CVC *</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => handleCvcChange(e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    aria-invalid={!!errors.cvc}
                    aria-describedby={errors.cvc ? "cvc-error" : undefined}
                  />
                  {errors.cvc && (
                    <p id="cvc-error" className="text-sm text-destructive mt-1">
                      {errors.cvc}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-muted p-3 rounded-lg">
                <Checkbox
                  id="agreed"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  aria-invalid={!!errors.agreed}
                />
                <div className="flex-1">
                  <label
                    htmlFor="agreed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I understand this is a <strong>demo</strong> *
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    No real payment will be processed
                  </p>
                  {errors.agreed && (
                    <p className="text-xs text-destructive mt-1">{errors.agreed}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Pay {DEMO_DEPOSIT_AMOUNT.toLocaleString()} ₸
                </Button>
              </div>
            </form>
          </>
        )}

        {step === "processing" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Processing payment...</p>
            <p className="text-sm text-muted-foreground">
              Simulating payment gateway • DEMO MODE
            </p>
          </div>
        )}

        {step === "success" && payment && (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h3 className="text-xl font-bold">Payment Simulated</h3>
              <Badge variant="secondary" className="text-xs">
                DEMO • No Funds Transferred
              </Badge>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-mono font-semibold">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dorm:</span>
                <span className="font-medium">{payment.dormName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold">{payment.amount.toLocaleString()} ₸</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date(payment.timestamp).toLocaleString()}</span>
              </div>
              {requestId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-mono text-xs">{requestId}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  track("view_demo_receipt", { paymentId: payment.id });
                  window.print();
                }}
                className="flex-1"
              >
                View Demo Receipt
              </Button>
            </div>
          </div>
        )}

        {step === "declined" && (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-2">
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h3 className="text-xl font-bold">Demo Declined</h3>
              <p className="text-sm text-muted-foreground">
                This is a simulated decline to demonstrate real-world scenarios
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Common reasons for decline:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                  <li>Insufficient funds</li>
                  <li>Incorrect card details</li>
                  <li>Card security measures</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleReset} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
