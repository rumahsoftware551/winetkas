import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "ispfinance_session";
const SESSION_DAYS = 7;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          company: true,
          userRoles: {
            include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    companyId: session.user.companyId,
    companyName: session.user.company.name,
    roles: session.user.userRoles.map((item) => item.role.name),
    permissions: new Set(session.user.userRoles.flatMap((item) => item.role.rolePermissions.map((row) => row.permission.code))),
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
