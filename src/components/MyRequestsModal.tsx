import { useState, useEffect } from "react";
import { Trash2, DollarSign, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getDormRequests, deleteDormRequest, DormRequest, getPayments, updatePaymentStatus, updateRequestPayment } from "@/lib/storage";
import { track } from "@/lib/tracking";
import { toast } from "sonner";

interface MyRequestsModalProps {
  open: boolean;
  onClose: () => void;
}

export function MyRequestsModal({ open, onClose }: MyRequestsModalProps) {
  const [requests, setRequests] = useState<DormRequest[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      track("view_requests", {});
      loadRequests();
    }
  }, [open]);

  const loadRequests = () => {
    const data = getDormRequests();
    setRequests(data);
  };

  const handleDelete = () => {
    if (!deleteId) return;

    try {
      deleteDormRequest(deleteId);
      track("delete_request", { requestId: deleteId });
      toast.success("Request deleted");
      loadRequests();
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete request");
      console.error(error);
    }
  };

  const handleRefund = () => {
    if (!refundPaymentId) return;

    try {
      updatePaymentStatus(refundPaymentId, "refunded");
      
      // Find and update the request
      const request = requests.find(r => r.paymentId === refundPaymentId);
      if (request) {
        updateRequestPayment(request.id, refundPaymentId, "refunded");
      }

      track("refund_mock", { paymentId: refundPaymentId });
      toast.success("Payment refunded (mock)");
      loadRequests();
      setRefundPaymentId(null);
    } catch (error) {
      toast.error("Failed to refund payment");
      console.error(error);
    }
  };

  const getPaymentInfo = (paymentId: string) => {
    const payments = getPayments();
    return payments.find(p => p.id === paymentId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Requests</DialogTitle>
          </DialogHeader>

          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't submitted any requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => {
                const payment = request.paymentId ? getPaymentInfo(request.paymentId) : null;
                
                return (
                  <div key={request.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{request.dormName}</h4>
                        <p className="text-sm text-muted-foreground">Request #{request.id}</p>
                        {payment && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={payment.status === "authorized" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              <DollarSign size={12} className="mr-1" />
                              {payment.status === "authorized" ? "Deposit Authorized" : "Refunded"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(request.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span> {request.fullName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">University:</span> {request.university}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact:</span> {request.contactValue}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Room:</span> {request.roomType}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Budget:</span> {request.budget.toLocaleString()} ₸
                      </div>
                      <div>
                        <span className="text-muted-foreground">Move-in:</span> {request.moveInMonth}
                      </div>
                    </div>

                    {payment && (
                      <div className="mt-3 bg-muted p-3 rounded-lg">
                        <h5 className="text-sm font-semibold mb-2">Payment Details</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Payment ID:</span> #{payment.id}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span> {payment.amount.toLocaleString()} ₸
                          </div>
                          <div>
                            <span className="text-muted-foreground">Method:</span> {payment.method}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span> {payment.status}
                          </div>
                          {payment.cardLast4 && (
                            <div>
                              <span className="text-muted-foreground">Card:</span> •••• {payment.cardLast4}
                            </div>
                          )}
                        </div>
                        {payment.status === "authorized" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => setRefundPaymentId(payment.id)}
                          >
                            <RefreshCw size={14} className="mr-1" />
                            Refund (mock)
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Submitted: {new Date(request.timestamp).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!refundPaymentId} onOpenChange={(open) => !open && setRefundPaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund Payment</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the payment as refunded (mock). This action is for demonstration purposes only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund}>
              Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
