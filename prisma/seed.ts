import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding users...");

  // find teams first
  const engineering = await prisma.team.findUnique({
    where: { code: "eng-2026" },
  });

  const marketing = await prisma.team.findUnique({
    where: { code: "mrk-2026" },
  });

  const sales = await prisma.team.findUnique({
    where: { code: "sle-2026" },
  });

  if (!engineering || !marketing || !sales) {
    throw new Error("Seed teams first.");
  }

  await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Main Admin",
        email: "admin@example.com",
        password: "123456",
        role: Role.ADMIN,
        teamId: engineering.id,
      },
    }),

    prisma.user.upsert({
      where: { email: "manager@example.com" },
      update: {},
      create: {
        name: "Engineering Manager",
        email: "manager@example.com",
        password: "123456",
        role: Role.MANAGER,
        teamId: engineering.id,
      },
    }),

    prisma.user.upsert({
      where: { email: "user1@example.com" },
      update: {},
      create: {
        name: "John Doe",
        email: "user1@example.com",
        password: "123456",
        role: Role.USER,
        teamId: engineering.id,
      },
    }),

    prisma.user.upsert({
      where: { email: "user2@example.com" },
      update: {},
      create: {
        name: "Jane Smith",
        email: "user2@example.com",
        password: "123456",
        role: Role.USER,
        teamId: marketing.id,
      },
    }),

    prisma.user.upsert({
      where: { email: "guest@example.com" },
      update: {},
      create: {
        name: "Guest User",
        email: "guest@example.com",
        password: "123456",
        role: Role.GUEST,
        teamId: sales.id,
      },
    }),
  ]);

  console.log("Users seeded successfully!");
}

main()
  .catch((e) => {
    console.log("error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });