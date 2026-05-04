import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo",
      settings: "{}",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@ciao.dev" },
    update: {},
    create: {
      email: "admin@ciao.dev",
      password: await hash("admin123", 12),
      name: "Admin",
      workspaceId: workspace.id,
    },
  });

  console.log("Seed complete: admin user (admin@ciao.dev / admin123) + demo workspace");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
