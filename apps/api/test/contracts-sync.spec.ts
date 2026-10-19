import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ENUMS } from "@bmi/contracts";

// Guards CLAUDE.md rule: shared enums stay in sync with the Prisma schema.
describe("contracts ↔ prisma enums", () => {
  const schema = readFileSync(join(__dirname, "../prisma/schema.prisma"), "utf8");
  const prismaEnums = Object.fromEntries(
    [...schema.matchAll(/enum (\w+) \{([^}]*)\}/g)].map(([, name, body]) => [name, body.trim().split(/\s+/)]),
  );

  it("declares the same enum names", () => {
    expect(Object.keys(prismaEnums).sort()).toEqual(Object.keys(ENUMS).sort());
  });

  it.each(Object.entries(ENUMS))("%s has identical values", (name, values) => {
    expect(prismaEnums[name]).toEqual([...values]);
  });

  it("has no payment tables (MVP exclusion)", () => {
    expect(schema).not.toMatch(/model \w*Payment/i);
  });
});
