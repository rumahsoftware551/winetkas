import { PrismaClient, AccountType, NormalBalance, InvoiceStatus, DocumentStatus, PurchaseStatus, MovementStatus, MovementType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe-123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const company = await prisma.company.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: { name: "Nusantara Fiber Network" },
    create: { id: "00000000-0000-4000-8000-000000000001", name: "Nusantara Fiber Network" },
  });

  const branch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: "HO" } },
    update: {},
    create: { companyId: company.id, code: "HO", name: "Kantor Pusat", address: "Jakarta" },
  });
  const warehouse = await prisma.warehouse.upsert({
    where: { branchId_code: { branchId: branch.id, code: "GDG-01" } },
    update: {},
    create: { branchId: branch.id, code: "GDG-01", name: "Gudang Utama" },
  });

  const permissionCodes = [
    "dashboard.view", "finance.view", "finance.manage", "billing.view", "billing.manage",
    "inventory.view", "inventory.manage", "reports.view", "settings.manage", "audit.view", "approval.manage",
  ];
  for (const code of permissionCodes) {
    await prisma.permission.upsert({ where: { code }, update: {}, create: { code, name: code } });
  }

  const roles = [
    { code: "DIRECTOR", name: "Pemilik/Direktur", permissions: permissionCodes },
    { code: "FINANCE_ADMIN", name: "Admin Keuangan", permissions: ["dashboard.view", "finance.view", "finance.manage", "billing.view", "billing.manage", "reports.view"] },
    { code: "WAREHOUSE_ADMIN", name: "Admin Gudang", permissions: ["dashboard.view", "inventory.view", "inventory.manage"] },
  ];
  for (const roleInput of roles) {
    const role = await prisma.role.upsert({ where: { code: roleInput.code }, update: { name: roleInput.name }, create: { code: roleInput.code, name: roleInput.name } });
    const permissions = await prisma.permission.findMany({ where: { code: { in: roleInput.permissions } } });
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const users = [
    { email: "direktur@ispfinance.local", name: "Direktur Demo", role: "DIRECTOR" },
    { email: "keuangan@ispfinance.local", name: "Admin Keuangan", role: "FINANCE_ADMIN" },
    { email: "gudang@ispfinance.local", name: "Admin Gudang", role: "WAREHOUSE_ADMIN" },
  ];
  for (const input of users) {
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: { passwordHash },
      create: { companyId: company.id, email: input.email, name: input.name, passwordHash },
    });
    const role = await prisma.role.findUniqueOrThrow({ where: { code: input.role } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  }

  const accounts = [
    ["1101", "Kas", AccountType.ASSET, NormalBalance.DEBIT],
    ["1102", "Bank", AccountType.ASSET, NormalBalance.DEBIT],
    ["1201", "Piutang Pelanggan", AccountType.ASSET, NormalBalance.DEBIT],
    ["1301", "Persediaan", AccountType.ASSET, NormalBalance.DEBIT],
    ["2101", "Utang Usaha", AccountType.LIABILITY, NormalBalance.CREDIT],
    ["3101", "Modal", AccountType.EQUITY, NormalBalance.CREDIT],
    ["4101", "Pendapatan Layanan Internet", AccountType.REVENUE, NormalBalance.CREDIT],
    ["5101", "Beban Bandwidth", AccountType.EXPENSE, NormalBalance.DEBIT],
    ["5201", "Beban Operasional", AccountType.EXPENSE, NormalBalance.DEBIT],
  ] as const;
  for (const [code, name, type, normalBalance] of accounts) {
    await prisma.account.upsert({ where: { companyId_code: { companyId: company.id, code } }, update: {}, create: { companyId: company.id, code, name, type, normalBalance } });
  }

  const cash = await prisma.cashAccount.upsert({
    where: { companyId_code: { companyId: company.id, code: "BANK-BCA" } },
    update: { currentBalance: 128750000 },
    create: { companyId: company.id, code: "BANK-BCA", name: "BCA Operasional", bankName: "BCA", accountNumber: "****5510", openingBalance: 100000000, currentBalance: 128750000 },
  });
  await prisma.cashAccount.upsert({
    where: { companyId_code: { companyId: company.id, code: "KAS-HO" } },
    update: { currentBalance: 7250000 },
    create: { companyId: company.id, code: "KAS-HO", name: "Kas Kantor", openingBalance: 5000000, currentBalance: 7250000 },
  });

  const packageRows = [
    ["HOME-20", "Home 20 Mbps", 20, 250000],
    ["HOME-50", "Home 50 Mbps", 50, 450000],
    ["BIZ-100", "Business 100 Mbps", 100, 1250000],
  ] as const;
  const packages = [];
  for (const [code, name, speedMbps, monthlyPrice] of packageRows) {
    packages.push(await prisma.servicePackage.upsert({ where: { companyId_code: { companyId: company.id, code } }, update: {}, create: { companyId: company.id, code, name, speedMbps, monthlyPrice } }));
  }

  const customerNames = ["Toko Maju Jaya", "Klinik Sehat Sentosa", "Budi Santoso", "Siti Rahma", "Kopi Sudut Kota", "CV Sinar Teknologi", "Andi Pratama", "Rina Kurnia", "Bengkel Prima", "Yayasan Cerdas Bangsa", "Dewi Lestari", "PT Langit Digital"];
  const customers = [];
  for (let index = 0; index < customerNames.length; index += 1) {
    const servicePackage = packages[index % packages.length];
    customers.push(await prisma.customer.upsert({
      where: { companyId_customerNumber: { companyId: company.id, customerNumber: `CUST-${String(index + 1).padStart(6, "0")}` } },
      update: {},
      create: {
        companyId: company.id, branchId: branch.id, servicePackageId: servicePackage.id,
        customerNumber: `CUST-${String(index + 1).padStart(6, "0")}`, name: customerNames[index],
        phone: `0812-0000-${String(index + 1).padStart(4, "0")}`, installAddress: `Area layanan ${index + 1}, Jakarta`,
        monthlyBill: servicePackage.monthlyPrice, recurringDueDay: 10,
      },
    }));
  }

  const today = new Date();
  for (let monthOffset = 11; monthOffset >= 0; monthOffset -= 1) {
    const issueDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthOffset, 1));
    const dueDate = new Date(Date.UTC(issueDate.getUTCFullYear(), issueDate.getUTCMonth(), 10));
    const period = `${issueDate.getUTCFullYear()}-${String(issueDate.getUTCMonth() + 1).padStart(2, "0")}`;
    for (let index = 0; index < customers.length; index += 1) {
      const customer = customers[index];
      const total = Number(customer.monthlyBill);
      const isLatest = monthOffset === 0;
      const isPartial = isLatest && index === 1;
      const isUnpaid = isLatest && index < 4;
      const paidAmount = isPartial ? total / 2 : isUnpaid ? 0 : total;
      const status = paidAmount === total ? InvoiceStatus.PAID : paidAmount > 0 ? InvoiceStatus.PARTIALLY_PAID : dueDate < today ? InvoiceStatus.OVERDUE : InvoiceStatus.UNPAID;
      const documentNumber = `INV-${period.replace("-", "")}-${String(index + 1).padStart(5, "0")}`;
      const invoice = await prisma.invoice.upsert({
        where: { companyId_documentNumber: { companyId: company.id, documentNumber } },
        update: { status, paidAmount, remainingAmount: total - paidAmount },
        create: { companyId: company.id, branchId: branch.id, customerId: customer.id, documentNumber, period, issueDate, dueDate, subtotal: total, total, paidAmount, remainingAmount: total - paidAmount, status, postedAt: issueDate },
      });
      if (paidAmount > 0) {
        const paymentNumber = `PAY-${period.replace("-", "")}-${String(index + 1).padStart(5, "0")}`;
        const payment = await prisma.payment.upsert({
          where: { companyId_documentNumber: { companyId: company.id, documentNumber: paymentNumber } },
          update: { amount: paidAmount },
          create: { companyId: company.id, branchId: branch.id, cashAccountId: cash.id, documentNumber: paymentNumber, paymentDate: new Date(issueDate.getTime() + 4 * 86400000), amount: paidAmount, method: "TRANSFER", reference: `DEMO-${period}-${index + 1}`, status: DocumentStatus.POSTED, postedAt: new Date(issueDate.getTime() + 4 * 86400000) },
        });
        await prisma.paymentAllocation.upsert({ where: { paymentId_invoiceId: { paymentId: payment.id, invoiceId: invoice.id } }, update: { amount: paidAmount }, create: { paymentId: payment.id, invoiceId: invoice.id, amount: paidAmount } });
      }
    }
  }

  const category = await prisma.itemCategory.upsert({ where: { companyId_code: { companyId: company.id, code: "CPE" } }, update: {}, create: { companyId: company.id, code: "CPE", name: "Perangkat Pelanggan" } });
  const itemRows = [
    ["ONU-HG6243C", "ONU Fiber HG6243C", "PCS", 10, 325000, 38],
    ["RTR-AC1200", "Router WiFi AC1200", "PCS", 8, 275000, 6],
    ["DROP-1C", "Kabel Dropcore 1 Core", "METER", 500, 1850, 1250],
    ["CON-SCUPC", "Fast Connector SC/UPC", "PCS", 50, 12500, 84],
  ] as const;
  const items = [];
  for (const [sku, name, unit, minimumStock, averageCost, onHand] of itemRows) {
    const item = await prisma.item.upsert({ where: { companyId_sku: { companyId: company.id, sku } }, update: { averageCost }, create: { companyId: company.id, categoryId: category.id, sku, name, unit, minimumStock, lastCost: averageCost, averageCost } });
    items.push(item);
    await prisma.inventoryBalance.upsert({ where: { warehouseId_itemId: { warehouseId: warehouse.id, itemId: item.id } }, update: { onHand }, create: { warehouseId: warehouse.id, itemId: item.id, onHand } });
  }

  const supplier = await prisma.supplier.upsert({ where: { companyId_code: { companyId: company.id, code: "SUP-0001" } }, update: {}, create: { companyId: company.id, code: "SUP-0001", name: "PT Perangkat Jaringan Nusantara", phone: "021-0000-0000" } });
  await prisma.purchase.upsert({
    where: { companyId_documentNumber: { companyId: company.id, documentNumber: "PUR-202608-00001" } },
    update: {},
    create: { companyId: company.id, branchId: branch.id, warehouseId: warehouse.id, supplierId: supplier.id, documentNumber: "PUR-202608-00001", purchaseDate: new Date("2026-08-20"), type: "INVENTORY", total: 16250000, paymentTerms: "CREDIT_30_DAYS", status: PurchaseStatus.ORDERED, items: { create: [{ itemId: items[0].id, description: items[0].name, quantity: 50, unitPrice: 325000, amount: 16250000 }] } },
  });

  await prisma.stockMovement.upsert({
    where: { companyId_documentNumber: { companyId: company.id, documentNumber: "MOV-202608-00001" } },
    update: {},
    create: { companyId: company.id, documentNumber: "MOV-202608-00001", movementDate: new Date("2026-08-26"), type: MovementType.ISSUE_TO_TECHNICIAN, status: MovementStatus.IN_TRANSIT, sourceWarehouseId: warehouse.id, holderName: "Teknisi Demo", notes: "Material instalasi pelanggan", lines: { create: [{ itemId: items[2].id, quantity: 100 }] } },
  });

  console.info(`Seed selesai. Login: direktur@ispfinance.local / ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
