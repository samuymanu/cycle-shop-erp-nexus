
export interface BasePaymentInfo {
  method: PaymentMethod;
  amount: number;
  currency: 'VES' | 'USD';
}

export interface CashPaymentInfo extends BasePaymentInfo {
  method: PaymentMethod.CASH_VES | PaymentMethod.CASH_USD;
  receivedAmount?: number;
  change?: number;
}

export interface CardPaymentInfo extends BasePaymentInfo {
  method: PaymentMethod.CARD;
  cardType: 'debit' | 'credit';
  last4Digits: string;
  authCode: string;
  terminal?: string;
}

export interface TransferPaymentInfo extends BasePaymentInfo {
  method: PaymentMethod.TRANSFER;
  bankName: string;
  referenceNumber: string;
  senderAccount?: string;
}

export interface CreditPaymentInfo extends BasePaymentInfo {
  method: PaymentMethod.CREDIT;
  clientId: string;
  dueDate: string;
  interestRate?: number;
  installments?: number;
  notes?: string;
}

export interface ZellePaymentInfo extends BasePaymentInfo {
  method: PaymentMethod.ZELLE;
  holderName: string;
  confirmationNumber: string;
  email: string;
  phone?: string;
}

export interface USDTPaymentInfo extends BasePaymentInfo {
  method: PaymentMethod.USDT;
  walletAddress: string;
  transactionHash: string;
  network: 'TRC20' | 'ERC20' | 'BSC';
  rate: number; // Tasa de cambio usada
}

export type PaymentInfo = 
  | CashPaymentInfo 
  | CardPaymentInfo 
  | TransferPaymentInfo 
  | CreditPaymentInfo 
  | ZellePaymentInfo 
  | USDTPaymentInfo;

export interface SalePayment {
  id: string;
  saleId: string;
  paymentInfo: PaymentInfo;
  createdAt: string;
}

// Importar enums existentes
import { PaymentMethod } from './erp';
