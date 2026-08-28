"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type FormState = { error: string };

export async function createCustomerAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!user.permissions.has("billing.manage")) return { error: "Anda tidak memiliki izin mengelola pelanggan." };
  const parsed = z.object({
    name: z.string().trim().min(3),
    phone: z.string().trim().min(8),
    installAddress: z.string().trim().min(5),
    branchId: z.string().uuid(),
    servicePackageId: z.string().uuid(),
    monthlyBill: z.coerce.number().positive(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali data pelanggan yang wajib diisi." };

  const customer = await prisma.$transaction(async (tx) => {
    const sequence = await tx.documentSequence.upsert({
      where: { companyId_documentType: { companyId: user.companyId, documentType: "CUSTOMER" } },
      update: { currentValue: { increment: 1 } },
      create: { companyId: user.companyId, documentType: "CUSTOMER", prefix: "CUST", currentValue: 1 },
    });
    const created = await tx.customer.create({
      data: { companyId: user.companyId, branchId: parsed.data.branchId, servicePackageId: parsed.data.servicePackageId, customerNumber: `CUST-${String(sequence.currentValue).padStart(6, "0")}`, name: parsed.data.name, phone: parsed.data.phone, installAddress: parsed.data.installAddress, monthlyBill: parsed.data.monthlyBill },
    });
    await tx.auditLog.create({ data: { companyId: user.companyId, userId: user.id, module: "BILLING", action: "CREATE", entityType: "Customer", entityId: created.id, afterData: { customerNumber: created.customerNumber, name: created.name } } });
    return created;
  });
  revalidatePath("/tagihan/daftar-pelanggan");
  redirect(`/tagihan/daftar-pelanggan?created=${customer.customerNumber}`);
}

export async function createItemAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!user.permissions.has("inventory.manage")) return { error: "Anda tidak memiliki izin mengelola barang." };
  const parsed = z.object({
    sku: z.string().trim().min(3).max(32),
    name: z.string().trim().min(3),
    categoryId: z.string().uuid(),
    unit: z.string().trim().min(2),
    minimumStock: z.coerce.number().nonnegative(),
    averageCost: z.coerce.number().nonnegative(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali data barang yang wajib diisi." };

  try {
    const item = await prisma.item.create({ data: { ...parsed.data, companyId: user.companyId, lastCost: parsed.data.averageCost } });
    await prisma.auditLog.create({ data: { companyId: user.companyId, userId: user.id, module: "INVENTORY", action: "CREATE", entityType: "Item", entityId: item.id, afterData: { sku: item.sku, name: item.name } } });
  } catch {
    return { error: "SKU sudah digunakan atau data barang tidak dapat disimpan." };
  }
  revalidatePath("/inventory/database-barang");
  redirect("/inventory/database-barang?created=1");
}

export async function createMovementAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!user.permissions.has("inventory.manage")) return { error: "Anda tidak memiliki izin membuat movement." };
  const parsed = z.object({
    sourceWarehouseId: z.string().uuid(),
    itemId: z.string().uuid(),
    quantity: z.coerce.number().positive(),
    type: z.enum(["ISSUE_TO_TECHNICIAN", "PLACE_AT_CUSTOMER", "DAMAGED_OR_LOST"]),
    holderName: z.string().trim().min(3),
    notes: z.string().trim().max(500).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa sumber, barang, kuantitas, tujuan, dan jenis movement." };

  try {
    await prisma.$transaction(async (tx) => {
      const balance = await tx.inventoryBalance.findUnique({ where: { warehouseId_itemId: { warehouseId: parsed.data.sourceWarehouseId, itemId: parsed.data.itemId } } });
      const available = Number(balance?.onHand ?? 0) - Number(balance?.allocated ?? 0);
      if (!balance || available < parsed.data.quantity) throw new Error("INSUFFICIENT_STOCK");
      const sequence = await tx.documentSequence.upsert({
        where: { companyId_documentType: { companyId: user.companyId, documentType: "MOVEMENT" } },
        update: { currentValue: { increment: 1 } },
        create: { companyId: user.companyId, documentType: "MOVEMENT", prefix: "MOV", currentValue: 1 },
      });
      const date = new Date();
      const movement = await tx.stockMovement.create({
        data: { companyId: user.companyId, documentNumber: `MOV-${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(sequence.currentValue).padStart(5, "0")}`, movementDate: date, type: parsed.data.type, status: "IN_TRANSIT", sourceWarehouseId: parsed.data.sourceWarehouseId, holderName: parsed.data.holderName, notes: parsed.data.notes, lines: { create: [{ itemId: parsed.data.itemId, quantity: parsed.data.quantity }] } },
      });
      await tx.inventoryBalance.update({ where: { id: balance.id }, data: { onHand: { decrement: parsed.data.quantity }, inTransit: { increment: parsed.data.quantity } } });
      await tx.auditLog.create({ data: { companyId: user.companyId, userId: user.id, module: "INVENTORY", action: "POST", entityType: "StockMovement", entityId: movement.id, afterData: { documentNumber: movement.documentNumber, type: movement.type, quantity: parsed.data.quantity } } });
    });
  } catch (error) {
    return { error: error instanceof Error && error.message === "INSUFFICIENT_STOCK" ? "Stok tersedia tidak mencukupi untuk movement ini." : "Movement gagal diproses. Tidak ada stok yang berubah." };
  }
  revalidatePath("/inventory/movement-barang");
  redirect("/inventory/movement-barang?created=1");
}
