export type InvoiceState = "DRAFT" | "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";

export function deriveInvoiceStatus(input: {
  posted: boolean;
  cancelled?: boolean;
  total: number;
  paid: number;
  dueDate: Date;
  now?: Date;
}): InvoiceState {
  if (input.cancelled) return "CANCELLED";
  if (!input.posted) return "DRAFT";
  const remaining = input.total - input.paid;
  if (remaining <= 0) return "PAID";
  if (input.paid > 0) return "PARTIALLY_PAID";
  return input.dueDate < (input.now ?? new Date()) ? "OVERDUE" : "UNPAID";
}

export function isBalanced(lines: Array<{ debit: number; credit: number }>) {
  const debit = lines.reduce((total, line) => total + line.debit, 0);
  const credit = lines.reduce((total, line) => total + line.credit, 0);
  return Math.abs(debit - credit) < 0.005;
}

export function calculateAvailableStock(onHand: number, allocated: number) {
  return Math.max(0, onHand - allocated);
}

export function calculateWeightedAverage(input: {
  currentQuantity: number;
  currentAverageCost: number;
  receivedQuantity: number;
  receivedUnitCost: number;
}) {
  const totalQuantity = input.currentQuantity + input.receivedQuantity;
  if (totalQuantity <= 0) return 0;
  return (
    (input.currentQuantity * input.currentAverageCost + input.receivedQuantity * input.receivedUnitCost) /
    totalQuantity
  );
}
