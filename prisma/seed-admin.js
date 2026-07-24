import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "lavenderautospareparts@gmail.com";
  const adminName = "Admin User";

  console.log(`Seeding Admin User: ${adminEmail}...`);

  // 1. Check or invite/create user in Supabase Auth
  const { data: authUser, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(adminEmail, {
      data: { name: adminName, role: "ADMIN" },
    });

  let userId = authUser?.user?.id;

  if (inviteError) {
    console.log(`Invite notice: ${inviteError.message}`);
    // If user already exists, fetch from auth list
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersData.users.find((u) => u.email === adminEmail);
    if (existing) {
      userId = existing.id;
      console.log(`Found existing Supabase Auth User ID: ${userId}`);
    } else {
      console.error("Could not create or find Auth user:", inviteError);
      process.exit(1);
    }
  } else {
    console.log(`Successfully sent Supabase Auth invite to ${adminEmail}. User ID: ${userId}`);
  }

  if (userId) {
    // 2. Upsert matching row in Prisma User table
    const dbUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "ADMIN",
        isActive: true,
      },
      create: {
        id: userId,
        name: adminName,
        email: adminEmail,
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log(`✔ Admin user record created/updated in Prisma DB:`, dbUser);
  }

  // 3. Apply RLS policies SQL
  console.log("✔ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
