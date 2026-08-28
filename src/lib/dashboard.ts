import { prisma } from "@/lib/prisma";

export async function getDashboard(companyId: string) {
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [cash, revenue, expenses, receivables, overdue, purchases, balances, outstanding, budgets, recent, revenueTrend] = await Promise.all([
    prisma.cashAccount.aggregate({ where: { companyId, isActive: true }, _sum: { currentBalance: true } }),
    prisma.invoice.aggregate({ where: { companyId, period, status: { notIn: ["DRAFT", "CANCELLED"] } }, _sum: { total: true } }),
    prisma.transaction.aggregate({ where: { companyId, type: "EXPENSE", status: "POSTED", transactionDate: { gte: monthStart, lt: nextMonth } }, _sum: { amount: true } }),
    prisma.invoice.aggregate({ where: { companyId, remainingAmount: { gt: 0 }, status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } }, _sum: { remainingAmount: true } }),
    prisma.invoice.count({ where: { companyId, status: "OVERDUE", remainingAmount: { gt: 0 } } }),
    prisma.purchase.aggregate({ where: { companyId, status: { notIn: ["DRAFT", "CANCELLED"] } }, _sum: { total: true } }),
    prisma.inventoryBalance.findMany({ where: { warehouse: { branch: { companyId } } }, include: { item: true } }),
    prisma.stockMovement.count({ where: { companyId, status: { in: ["SUBMITTED", "APPROVED", "IN_TRANSIT"] } } }),
    prisma.budget.findMany({ where: { companyId, period }, select: { amount: true, realized: true } }),
    prisma.auditLog.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
    prisma.invoice.groupBy({ where: { companyId, status: { notIn: ["DRAFT", "CANCELLED"] } }, by: ["period"], _sum: { total: true }, orderBy: { period: "asc" }, take: 12 }),
  ]);

  const inventoryValue = balances.reduce((total, row) => total + Number(row.onHand) * Number(row.item.averageCost), 0);
  const lowStock = balances.filter((row) => Number(row.onHand) - Number(row.allocated) <= Number(row.item.minimumStock)).slice(0, 5);
  const budgetTotal = budgets.reduce((total, row) => total + Number(row.amount), 0);
  const budgetRealized = budgets.reduce((total, row) => total + Number(row.realized), 0);
  return {
    metrics: {
      cash: Number(cash._sum.currentBalance ?? 0), revenue: Number(revenue._sum.total ?? 0), expenses: Number(expenses._sum.amount ?? 0),
      profit: Number(revenue._sum.total ?? 0) - Number(expenses._sum.amount ?? 0), receivables: Number(receivables._sum.remainingAmount ?? 0),
      payables: Number(purchases._sum.total ?? 0), inventoryValue, outstanding, overdue,
    },
    trend: revenueTrend.map((row) => ({ period: row.period, value: Number(row._sum.total ?? 0) })),
    budget: { total: budgetTotal, realized: budgetRealized, percentage: budgetTotal ? Math.round((budgetRealized / budgetTotal) * 100) : 0 },
    lowStock: lowStock.map((row) => ({ name: row.item.name, sku: row.item.sku, available: Number(row.onHand) - Number(row.allocated), minimum: Number(row.item.minimumStock) })),
    recent: recent.map((row) => ({ id: row.id, module: row.module, action: row.action, user: row.user?.name ?? "Sistem", createdAt: row.createdAt })),
  };
}
