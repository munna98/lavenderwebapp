import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type AuthUser = {
  session: SupabaseUser;
  user: User;
  role: User["role"];
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) return null;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user || !user.isActive) return null;

    return {
      session: authUser,
      user,
      role: user.role,
    };
  } catch {
    return null;
  }
});

export async function requireAuth(): Promise<AuthUser> {
  const { redirect } = await import("next/navigation");
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");
  return auth!;
}

export async function requireAdmin(): Promise<AuthUser> {
  const { redirect } = await import("next/navigation");
  const auth = await requireAuth();
  if (auth.role !== "ADMIN") redirect("/");
  return auth;
}
