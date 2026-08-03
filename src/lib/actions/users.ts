"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Resend } from "resend";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "STAFF"]),
});

const UpdateUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Create a new user with Email & Password. Admin only.
 * Automatically sends welcome email from noreply@lavenderautoparts.com with login credentials and direct link via Resend.
 */
export async function createUser(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return { success: false, error: issues[0]?.message ?? "Validation failed" };
  }

  const { name, email, phone, password, role } = parsed.data;

  try {
    const adminClient = createAdminClient();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "A user with that email already exists." };
    }

    // 1. Create user in Supabase Auth with password, auto-confirmed email
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, phone: phone || undefined },
      });

    if (authError || !authData?.user) {
      return { success: false, error: authError?.message ?? "Failed to create user." };
    }

    // 2. Insert matching User row in Prisma DB
    await prisma.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        phone: phone || null,
        role,
        isActive: true,
      },
    });

    // 3. Send Welcome Email from noreply@lavenderautoparts.com
    const resend = new Resend(process.env.RESEND_API_KEY);
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;

    await resend.emails.send({
      from: "noreply@lavenderautoparts.com",
      to: [email],
      subject: "Welcome to Lavender Auto Spare Parts — Your Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E4E2DC; border-radius: 12px; background-color: #FAFAF8;">
          <h2 style="color: #1F5C4E; margin-top: 0; font-size: 20px;">Lavender Auto Spare Parts</h2>
          <p style="color: #1A1917; font-size: 14px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #4A4D4A; font-size: 14px; line-height: 1.5;">
            An account has been created for you on the Lavender Auto Spare Parts Purchase Order System.
          </p>
          
          <div style="background-color: #FFFFFF; border: 1px solid #E4E2DC; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #1A1917;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #1A1917;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 0; font-size: 14px; color: #1A1917;"><strong>Role:</strong> ${role}</p>
          </div>

          <p style="color: #4A4D4A; font-size: 14px; margin-bottom: 20px;">Please click the button below to sign in:</p>
          
          <a href="${loginUrl}" style="background-color: #1F5C4E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
            Sign In to System →
          </a>

          <p style="color: #70766F; font-size: 12px; margin-top: 30px; border-top: 1px solid #E4E2DC; padding-top: 12px;">
            Lavender Auto Spare Parts — Internal System.
          </p>
        </div>
      `,
    });

    revalidatePath("/settings/users");
    return { success: true, message: `User ${name} created and credentials emailed to ${email}!` };
  } catch (err) {
    console.error("createUser error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Update a user's role, active status, or password. Admin only.
 */
export async function updateUser(data: {
  userId: string;
  role?: "ADMIN" | "STAFF";
  isActive?: boolean;
  password?: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const parsed = UpdateUserSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return { success: false, error: issues[0]?.message ?? "Validation failed" };
  }

  const { userId, role, isActive, password } = parsed.data;

  try {
    const adminClient = createAdminClient();

    if (password) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        password,
      });
      if (authError) {
        return { success: false, error: authError.message };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    revalidatePath("/settings/users");
    return { success: true, message: "User updated successfully." };
  } catch {
    return { success: false, error: "Failed to update user." };
  }
}
