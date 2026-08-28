import { describe, expect, it } from "vitest";
import { calculateAvailableStock, calculateWeightedAverage, deriveInvoiceStatus, isBalanced } from "./finance";

describe("finance business rules", () => {
  it("derives paid and partial invoice status", () => {
    const dueDate = new Date("2026-08-10");
    expect(deriveInvoiceStatus({ posted: true, total: 250000, paid: 250000, dueDate })).toBe("PAID");
    expect(deriveInvoiceStatus({ posted: true, total: 250000, paid: 100000, dueDate })).toBe("PARTIALLY_PAID");
  });

  it("detects balanced journals", () => {
    expect(isBalanced([{ debit: 250000, credit: 0 }, { debit: 0, credit: 250000 }])).toBe(true);
    expect(isBalanced([{ debit: 200000, credit: 0 }, { debit: 0, credit: 250000 }])).toBe(false);
  });

  it("prevents negative available stock", () => {
    expect(calculateAvailableStock(10, 4)).toBe(6);
    expect(calculateAvailableStock(3, 5)).toBe(0);
  });

  it("calculates weighted average cost", () => {
    expect(calculateWeightedAverage({ currentQuantity: 10, currentAverageCost: 100, receivedQuantity: 10, receivedUnitCost: 200 })).toBe(150);
  });
});
