import prisma from "../src/connect";
import { hashSync } from "bcrypt";
async function main() {
  // Upsert the admin user to avoid duplicate entries
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin",
    },
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashSync("password", 10), // Ensure to hash this in a real app
      role: "ADMIN",
    },
  });

  console.log("Admin user created or updated:", adminUser);
}

main()
  .then(() => {
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
  });
