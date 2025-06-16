
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Banknote, CreditCard, Smartphone, DollarSign, Users } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import CashPaymentForm from './CashPaymentForm';
import TransferPaymentForm from './TransferPaymentForm';
import ZellePaymentForm from './ZellePaymentForm';
import CreditPaymentForm from './CreditPaymentForm';

interface PaymentMethodSelectorProps {
  totalAmount: number;
  payments: PaymentInfo[];
  onPaymentsUpdate: (payments: PaymentInfo[]) => void;
  onCreateClient?: () => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  totalAmount,
  payments,
  onPaymentsUpdate,
  onCreateClient,
}) => {
  const [activeTab, setActiveTab] = useState('cash');

  const handlePaymentAdded = (payment: PaymentInfo) => {
    onPaymentsUpdate([...payments, payment]);
  };

  const remainingAmount = Math.max(0, totalAmount - payments.reduce((sum, p) => {
    const amount = p.currency === 'USD' ? p.amount * 36 : p.amount;
    return sum + amount;
  }, 0));

  const currentAmount = remainingAmount > 0 ? remainingAmount : totalAmount;

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none">
            <TabsTrigger value="cash" className="gap-2">
              <Banknote className="h-4 w-4" />
              Efectivo
            </TabsTrigger>
            <TabsTrigger value="transfer" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Transferencia
            </TabsTrigger>
            <TabsTrigger value="zelle" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Zelle
            </TabsTrigger>
            <TabsTrigger value="credit" className="gap-2">
              <Users className="h-4 w-4" />
              Crédito
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="cash" className="mt-0">
              <CashPaymentForm
                paymentInfo={{}}
                onUpdate={(info) => {
                  if (info.amount) {
                    handlePaymentAdded(info as PaymentInfo);
                  }
                }}
                totalAmount={currentAmount}
              />
            </TabsContent>

            <TabsContent value="transfer" className="mt-0">
              <TransferPaymentForm
                paymentInfo={{}}
                onUpdate={(info) => {
                  if (info.amount) {
                    handlePaymentAdded(info as PaymentInfo);
                  }
                }}
                totalAmount={currentAmount}
              />
            </TabsContent>

            <TabsContent value="zelle" className="mt-0">
              <ZellePaymentForm
                paymentInfo={{}}
                onUpdate={(info) => {
                  if (info.amount) {
                    handlePaymentAdded(info as PaymentInfo);
                  }
                }}
                totalAmount={currentAmount}
              />
            </TabsContent>

            <TabsContent value="credit" className="mt-0">
              <CreditPaymentForm
                totalAmount={currentAmount}
                onPaymentAdded={handlePaymentAdded}
                onCreateClient={onCreateClient}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
