"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type LoginState = { error: string };

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.object({ email: z.email(), password: z.string().min(8) }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Masukkan email dan kata sandi yang valid." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.status !== "ACTIVE" || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: "Email atau kata sandi tidak sesuai." };
  }

  await createSession(user.id);
  await prisma.auditLog.create({ data: { companyId: user.companyId, userId: user.id, module: "AUTH", action: "LOGIN", entityType: "User", entityId: user.id } });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
