import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { backfillLegacyCourse } from "../src/lib/legacyCourse";
import { ADMIN_GITHUB_NICKNAME } from "../src/lib/constants";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findUnique({
    where: { githubNickname: ADMIN_GITHUB_NICKNAME },
    select: { id: true },
  });

  if (!admin) {
    console.warn(
      `Skipping legacy course backfill because admin user "${ADMIN_GITHUB_NICKNAME}" does not exist yet.`,
    );
    return;
  }

  await backfillLegacyCourse(prisma);
  console.log("Legacy course backfilled.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
