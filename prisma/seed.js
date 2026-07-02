const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Seeded");
}

main();
