import { PrismaClient } from "@prisma/client";

// Runs only when DATABASE_URL points at a migrated database (local Postgres or Docker Compose).
const url = process.env.DATABASE_URL;
const run = url && !url.includes("stub") ? describe : describe.skip;

run("database (integration)", () => {
  const prisma = new PrismaClient();
  afterAll(() => prisma.$disconnect());

  it("has all migrations applied", async () => {
    const rows = await prisma.$queryRaw<
      { n: bigint }[]
    >`SELECT count(*) AS n FROM _prisma_migrations WHERE finished_at IS NOT NULL`;
    expect(Number(rows[0].n)).toBeGreaterThan(0);
  });

  it("enforces unique plot numbers within a project", async () => {
    const p = await prisma.project.create({ data: { slug: `test-${Date.now()}`, name: "Synthetic test project" } });
    try {
      await prisma.plot.create({ data: { projectId: p.id, plotNumber: "A-01", areaSqft: 1200 } });
      await expect(
        prisma.plot.create({ data: { projectId: p.id, plotNumber: "A-01", areaSqft: 1200 } }),
      ).rejects.toThrow();
    } finally {
      await prisma.plot.deleteMany({ where: { projectId: p.id } });
      await prisma.project.delete({ where: { id: p.id } });
    }
  });
});
