import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const auth = await getCurrentUser();
  if (auth) {
    redirect("/po");
  } else {
    redirect("/login");
  }
}

