
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentInfo } from '@/types/payment';
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector';

interface PaymentSectionProps {
  cart: any[];
  calculateTotal: () => number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
  canProcessSale: () => boolean;
  processSale: () => Promise<void>;
  isProcessing: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  cart,
  calculateTotal,
  payments,
  onPaymentsUpdate,
  canProcessSale,
  processSale,
  isProcessing,
}) => {
  if (cart.length === 0) return null;

  return (
    <Card className="bikeERP-card">
      <CardContent className="p-4">
        <PaymentMethodSelector
          totalAmount={calculateTotal()}
          payments={payments}
          onPaymentsUpdate={onPaymentsUpdate}
        />

        <div className="mt-4">
          <Button
            onClick={processSale}
            className="w-full bikeERP-button-success text-white"
            size="lg"
            disabled={isProcessing || !canProcessSale()}
          >
            {isProcessing ? 'Procesando...' :
              !canProcessSale() ? 'Complete el pago' : 'Procesar Venta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
