import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setPassword() {
  const email = "lavenderautospareparts@gmail.com";
  const newPassword = process.argv[2] || "Lavender@2026";

  console.log(`Setting password for ${email}...`);

  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("List users error:", listError);
    process.exit(1);
  }

  const user = usersData.users.find((u) => u.email === email);
  if (!user) {
    console.error(`User ${email} not found in Supabase Auth.`);
    process.exit(1);
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true, // Auto-confirm email so no verification email needed!
  });

  if (updateError) {
    console.error("Update password error:", updateError);
  } else {
    console.log(`✔ Password successfully set to: ${newPassword}`);
    console.log(`✔ Email auto-confirmed for ${email}!`);
  }
}

setPassword();
