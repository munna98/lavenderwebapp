import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default Cash Customer...");

  const cashCustomer = await prisma.customer.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {
      name: "Cash Customer",
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Cash Customer",
      address: "Walk-in Counter",
      email: null,
      phone: null,
    },
  });

  console.log("✔ Cash Customer created/updated in Prisma DB:", cashCustomer);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
