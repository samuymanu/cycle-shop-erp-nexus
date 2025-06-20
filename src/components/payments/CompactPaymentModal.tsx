
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PaymentInfo, PaymentMethod } from '@/types/payment';
import CashPaymentForm from './CashPaymentForm';
import ZellePaymentForm from './ZellePaymentForm';
import TransferPaymentForm from './TransferPaymentForm';
import EnhancedCreditPaymentForm from './EnhancedCreditPaymentForm';
import QuickCompletePayment from './QuickCompletePayment';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';
import { X, CreditCard, DollarSign, Trash2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('quick');

  useEffect(() => {
    if (!isOpen) {
      setPayments([]);
      setNotes('');
      setActiveTab('quick');
    }
  }, [isOpen]);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = totalAmount - totalPaid;
  const isComplete = Math.abs(remaining) < 0.01;

  const addPayment = (payment: PaymentInfo) => {
    setPayments(prev => [...prev, payment]);
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = () => {
    if (isComplete) {
      onProcessPayment(payments, notes);
    }
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH_USD: return 'Efectivo USD';
      case PaymentMethod.CASH_VES: return 'Efectivo Bs.S';
      case PaymentMethod.ZELLE: return 'Zelle';
      case PaymentMethod.TRANSFER: return 'Transferencia';
      case PaymentMethod.CARD: return 'Tarjeta';
      case PaymentMethod.CREDIT: return 'Crédito';
      default: return method;
    }
  };

  const handleQuickCompletePayment = async (quickPayments: PaymentInfo[]) => {
    onProcessPayment(quickPayments, notes);
  };

  const handleOpenMixedPayment = () => {
    // Ya estamos en modo mixto, no necesitamos hacer nada especial
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Procesar Pago
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Resumen de pago - compacto */}
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <MultiCurrencyPrice usdAmount={totalAmount} size="sm" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Pagado</div>
                <MultiCurrencyPrice usdAmount={totalPaid} size="sm" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Pendiente</div>
                <div className={`font-bold ${remaining > 0.01 ? 'text-red-600' : remaining < -0.01 ? 'text-blue-600' : 'text-green-600'}`}>
                  ${Math.abs(remaining).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido principal - sin scroll, layout optimizado */}
        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Panel izquierdo: Métodos de pago */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
                <TabsTrigger value="quick">Rápido</TabsTrigger>
                <TabsTrigger value="cash">Efectivo</TabsTrigger>
                <TabsTrigger value="digital">Digital</TabsTrigger>
                <TabsTrigger value="credit">Crédito</TabsTrigger>
              </TabsList>

              <div className="flex-1 mt-3 overflow-hidden">
                <TabsContent value="quick" className="mt-0 h-full overflow-hidden">
                  {/* Sección rápida optimizada sin scroll */}
                  <div className="h-full">
                    <QuickCompletePayment
                      totalAmount={remaining}
                      onCompletePayment={handleQuickCompletePayment}
                      onOpenMixedPayment={handleOpenMixedPayment}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="cash" className="mt-0 h-full overflow-y-auto">
                  <CashPaymentForm
                    paymentInfo={{}}
                    onUpdate={() => {}}
                    totalAmount={remaining}
                  />
                </TabsContent>

                <TabsContent value="digital" className="mt-0 h-full overflow-y-auto">
                  <div className="space-y-4">
                    <ZellePaymentForm
                      paymentInfo={{}}
                      onUpdate={() => {}}
                      totalAmount={remaining}
                    />
                    <TransferPaymentForm
                      paymentInfo={{}}
                      onUpdate={() => {}}
                      totalAmount={remaining}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="credit" className="mt-0 h-full overflow-y-auto">
                  <EnhancedCreditPaymentForm
                    totalAmount={remaining}
                    onAddPayment={addPayment}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Panel derecho: Resumen de pagos - compacto */}
          <div className="w-80 flex-shrink-0 bg-gray-50 rounded-lg p-4 flex flex-col">
            <h3 className="font-semibold mb-3 text-gray-900">Pagos Registrados</h3>
            
            {payments.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No hay pagos registrados</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-y-auto">
                {payments.map((payment, index) => (
                  <div key={index} className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {getPaymentMethodName(payment.method)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePayment(index)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-sm font-medium">
                      ${payment.amount.toFixed(2)} {payment.currency}
                    </div>
                    {payment.notes && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {payment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Botón de procesar - siempre visible */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <Button
                onClick={handleProcess}
                disabled={!isComplete || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                size="lg"
              >
                {isProcessing ? (
                  'Procesando...'
                ) : isComplete ? (
                  `Completar Venta - $${totalAmount.toFixed(2)}`
                ) : (
                  `Faltan $${remaining.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompactPaymentModal;
