export const DEPOSIT_AMOUNT = 5000;

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, "");
  if (!/^\d+$/.test(digits)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s/g, "");
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(" ").substring(0, 19); // Max 16 digits + 3 spaces
}

export function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
  }
  return cleaned;
}

export function validateExpiry(expiry: string): boolean {
  const [month, year] = expiry.split("/");
  if (!month || !year || month.length !== 2 || year.length !== 2) return false;
  
  const monthNum = parseInt(month);
  const yearNum = parseInt("20" + year);
  
  if (monthNum < 1 || monthNum > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;
  
  return true;
}

export async function tryPaymentRequestAPI(amount: number): Promise<{ success: boolean; method?: string }> {
  if (!window.PaymentRequest) {
    return { success: false };
  }

  try {
    const methodData = [{
      supportedMethods: "basic-card",
      data: {
        supportedNetworks: ["visa", "mastercard"],
      }
    }];

    const details = {
      total: {
        label: "Dorm reservation deposit (prototype)",
        amount: { currency: "KZT", value: amount.toString() }
      }
    };

    const request = new PaymentRequest(methodData, details);
    
    // Check if payment can be made
    const canMakePayment = await request.canMakePayment();
    if (!canMakePayment) {
      return { success: false };
    }

    const response = await request.show();
    await response.complete("success");
    
    return { success: true, method: "PaymentRequest" };
  } catch (error) {
    console.log("Payment Request API not available or cancelled:", error);
    return { success: false };
  }
}
