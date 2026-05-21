export type Currency = "MYR" | "SGD" | "USD" | "EUR" | "GBP" | "IDR" | "THB";

export type SplitMode = "equal" | "custom";

export interface Participant {
  id: string;
  billId: string;
  name: string;
  amount: number;
  paid: boolean;
  paidAt: string | null;
  paymentNote: string | null;
  receiptPath: string | null;
  createdAt: string;
}

export interface Bill {
  id: string;
  title: string;
  description: string | null;
  totalAmount: number;
  currency: Currency;
  splitMode: SplitMode;
  dueDate: string | null;
  organizerName: string | null;
  paymentInstructions: string | null;
  paymentQrPath: string | null;
  createdAt: string;
  participants: Participant[];
}

export interface BillWithToken extends Bill {
  organizerToken: string;
}

export interface CreateBillInput {
  title: string;
  description?: string;
  totalAmount: number;
  currency: Currency;
  splitMode: SplitMode;
  dueDate?: string | null;
  organizerName?: string;
  paymentInstructions?: string | null;
  paymentQrPath?: string | null;
  participants: Array<{ name: string; amount: number }>;
}

export interface BillStats {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paidCount: number;
  totalCount: number;
  progress: number;
  complete: boolean;
}
