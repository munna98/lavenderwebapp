import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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

    if (!user || !user.isActive) {
      // Clear orphaned or deactivated Supabase session
      await supabase.auth.signOut();
      return null;
    }

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
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");
  return auth;
}

export async function requireAdmin(): Promise<AuthUser> {
  const auth = await requireAuth();
  if (auth.role !== "ADMIN") redirect("/");
  return auth;
}
