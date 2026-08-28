import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell user={{ name: user.name, email: user.email, companyName: user.companyName, roles: user.roles, permissions: Array.from(user.permissions) }}>{children}</AppShell>;
}
