import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const ADMIN_GITHUB_NICKNAME = "ivanbunin";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = process.argv[2] || "admin123";

  console.log(`Creating admin user: ${ADMIN_GITHUB_NICKNAME}`);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { githubNickname: ADMIN_GITHUB_NICKNAME },
    update: {},
    create: {
      githubNickname: ADMIN_GITHUB_NICKNAME,
      displayName: "Ivan Bunin",
      passwordHash,
      role: "admin",
    },
  });

  console.log("Admin user created:", user.id, user.githubNickname);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
