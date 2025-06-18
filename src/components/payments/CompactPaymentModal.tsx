
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PaymentMethodSelector from './PaymentMethodSelector';
import QuickPaymentMethods from './QuickPaymentMethods';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';
import { PaymentMethod } from '@/types/erp';
import { PaymentInfo } from '@/types/payment';
import { CreditCard, X } from 'lucide-react';

interface CompactPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onProcessPayment: (payments: PaymentInfo[], notes?: string) => void;
  isProcessing?: boolean;
}

const CompactPaymentModal: React.FC<CompactPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
  isProcessing = false,
}) => {
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [notes, setNotes] = useState('');

  const totalPaid = payments.reduce((sum, payment) => {
    // Convert to USD for comparison
    const amountInUSD = payment.currency === 'USD' ? payment.amount : payment.amount / 36; // Simple conversion
    return sum + amountInUSD;
  }, 0);

  const remaining = totalAmount - totalPaid;
  const canComplete = remaining <= 0.01;

  const handleComplete = () => {
    if (canComplete) {
      onProcessPayment(payments, notes);
    }
  };

  const handleQuickPayment = (newPayments: PaymentInfo[]) => {
    onProcessPayment(newPayments, notes);
  };

  const handlePaymentsUpdate = (newPayments: PaymentInfo[]) => {
    setPayments(newPayments);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Procesar Pago
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda - Resumen y métodos rápidos */}
          <div className="space-y-4">
            {/* Resumen de la transacción */}
            <div className="bikeERP-card p-4">
              <h3 className="font-semibold mb-3">Resumen de Venta</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total a Pagar:</span>
                  <MultiCurrencyPrice usdAmount={totalAmount} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span>Total Pagado:</span>
                  <MultiCurrencyPrice usdAmount={totalPaid} size="sm" />
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Restante:</span>
                  <MultiCurrencyPrice usdAmount={remaining} size="sm" />
                </div>
              </div>
            </div>

            {/* Métodos de pago rápido */}
            <QuickPaymentMethods
              totalAmount={totalAmount}
              payments={payments}
              onPaymentsUpdate={handlePaymentsUpdate}
            />

            {/* Pagos agregados */}
            {payments.length > 0 && (
              <div className="bikeERP-card p-4">
                <h3 className="font-semibold mb-3">Pagos Agregados</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{payment.method.toUpperCase()}</span>
                        <div className="text-xs text-gray-600">
                          {payment.currency === 'USD' ? '$' : 'Bs.S '}{payment.amount.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newPayments = payments.filter((_, i) => i !== index);
                          setPayments(newPayments);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Métodos especiales */}
          <div className="space-y-4">
            <PaymentMethodSelector
              totalAmount={totalAmount}
              payments={payments}
              onPaymentsUpdate={handlePaymentsUpdate}
            />

            {/* Notas */}
            <div className="bikeERP-card p-4">
              <h3 className="font-semibold mb-3">Notas (Opcional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre la venta..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Footer con botón de completar */}
        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {canComplete ? '✅ Pago completo' : `Falta: $${remaining.toFixed(2)}`}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!canComplete || isProcessing}
                className="bikeERP-button-primary"
              >
                {isProcessing ? 'Procesando...' : 'Completar Venta'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompactPaymentModal;
