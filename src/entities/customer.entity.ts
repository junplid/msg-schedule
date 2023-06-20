export type Invoice_T = "PAY" | "PENDING";

export interface Customer {
  readonly id: number;
  full_name: string;
  whatsapp: string;
  login: string;
  password: string;
  invoice: Invoice_T;
  dueDate: Date;
  comments: string;
  readonly planId: number;
  readonly productId: number;
  readonly messageId: number[];
}
