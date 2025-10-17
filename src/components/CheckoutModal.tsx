import { useState, useEffect } from "react";
import { CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEPOSIT_AMOUNT, tryPaymentRequestAPI, luhnCheck, formatCardNumber, formatExpiry, validateExpiry } from "@/lib/payment";
import { savePayment, Payment } from "@/lib/storage";
import { track } from "@/lib/tracking";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
  requestId: string;
}

export function CheckoutModal({ open, onClose, onSuccess, requestId }: CheckoutModalProps) {
  const [step, setStep] = useState<"init" | "card" | "processing" | "success" | "error">("init");
  const [paymentResult, setPaymentResult] = useState<Payment | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      track("open_checkout", { requestId, amount: DEPOSIT_AMOUNT });
      attemptPaymentRequest();
    }
  }, [open, requestId]);

  const attemptPaymentRequest = async () => {
    setStep("init");
    const result = await tryPaymentRequestAPI(DEPOSIT_AMOUNT);
    
    if (result.success) {
      track("payment_attempt", { requestId, method: "PaymentRequest" });
      handlePaymentSuccess("PaymentRequest");
    } else {
      setStep("card");
    }
  };

  const validateCardForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardData.name.trim()) {
      newErrors.name = "Cardholder name is required";
    }

    if (!luhnCheck(cardData.number)) {
      newErrors.number = "Invalid card number";
    }

    if (!validateExpiry(cardData.expiry)) {
      newErrors.expiry = "Invalid or expired date";
    }

    if (!/^\d{3}$/.test(cardData.cvc)) {
      newErrors.cvc = "CVC must be 3 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSuccess = (method: "PaymentRequest" | "MockCard", cardLast4?: string) => {
    const payment = savePayment({
      requestId,
      amount: DEPOSIT_AMOUNT,
      method,
      status: "authorized",
      cardLast4
    });

    track("payment_success", { 
      requestId, 
      paymentId: payment.id, 
      method, 
      amount: DEPOSIT_AMOUNT 
    });

    setPaymentResult(payment);
    setStep("success");
    onSuccess(payment);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCardForm()) {
      return;
    }

    track("payment_attempt", { requestId, method: "MockCard" });
    setStep("processing");

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Deterministic: if Luhn passes, payment succeeds
    if (luhnCheck(cardData.number)) {
      const last4 = cardData.number.replace(/\s/g, "").slice(-4);
      handlePaymentSuccess("MockCard", last4);
    } else {
      track("payment_failure", { requestId, method: "MockCard", reason: "Invalid card" });
      setErrorMessage("Payment failed. Please check your card details.");
      setStep("error");
    }
  };

  const handleRetry = () => {
    setStep("card");
    setErrorMessage("");
    setErrors({});
  };

  const handleSkip = () => {
    track("payment_skip", { requestId });
    onClose();
  };

  const handleClose = () => {
    if (step === "success") {
      onClose();
      // Reset after closing
      setTimeout(() => {
        setStep("init");
        setCardData({ number: "", expiry: "", cvc: "", name: "" });
        setErrors({});
        setPaymentResult(null);
      }, 300);
    } else {
      handleSkip();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Checkout</DialogTitle>
        </DialogHeader>

        {step === "init" && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-muted-foreground">Checking payment options...</p>
          </div>
        )}

        {step === "card" && (
          <form onSubmit={handleCardSubmit} className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center mb-4">
              <p className="text-sm text-muted-foreground mb-1">Reservation deposit</p>
              <p className="text-2xl font-bold text-primary">{DEPOSIT_AMOUNT.toLocaleString()} ₸</p>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Prototype demo — no real charge
              </p>
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.number && <p className="text-xs text-destructive mt-1">{errors.number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry (MM/YY) *</Label>
                <Input
                  id="expiry"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                  placeholder="12/25"
                  maxLength={5}
                />
                {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <Label htmlFor="cvc">CVC *</Label>
                <Input
                  id="cvc"
                  value={cardData.cvc}
                  onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, "").substring(0, 3) })}
                  placeholder="123"
                  maxLength={3}
                />
                {errors.cvc && <p className="text-xs text-destructive mt-1">{errors.cvc}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="name">Cardholder Name *</Label>
              <Input
                id="name"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleSkip} className="flex-1">
                Skip payment
              </Button>
              <Button type="submit" className="flex-1">
                <CreditCard className="mr-2" size={16} />
                Pay {DEPOSIT_AMOUNT.toLocaleString()} ₸
              </Button>
            </div>
          </form>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
            <p className="text-muted-foreground">Processing payment...</p>
          </div>
        )}

        {step === "success" && paymentResult && (
          <div className="text-center py-8">
            <CheckCircle2 className="mx-auto mb-4 text-success" size={64} />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <div className="bg-muted p-4 rounded-lg text-left mb-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Payment ID:</span> #{paymentResult.id}</p>
                <p><span className="text-muted-foreground">Amount:</span> {paymentResult.amount.toLocaleString()} ₸</p>
                <p><span className="text-muted-foreground">Method:</span> {paymentResult.method}</p>
                {paymentResult.cardLast4 && (
                  <p><span className="text-muted-foreground">Card:</span> •••• {paymentResult.cardLast4}</p>
                )}
                <p><span className="text-muted-foreground">Status:</span> Deposit authorized (mock)</p>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-8">
            <XCircle className="mx-auto mb-4 text-destructive" size={64} />
            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip payment
              </Button>
              <Button onClick={handleRetry} className="flex-1">
                Try again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
