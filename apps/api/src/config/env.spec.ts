import { validateEnv } from "./env";

const base = { DATABASE_URL: "postgresql://u:p@localhost:5432/db" };

describe("validateEnv", () => {
  it("applies defaults", () => {
    const env = validateEnv(base);
    expect(env.API_PORT).toBe(4000);
    expect(env.NODE_ENV).toBe("development");
    expect(env.CORS_ALLOWED_ORIGINS).toEqual(["http://localhost:3000"]);
    expect(env.CRM_ADAPTER).toBe("sandbox");
  });

  it("splits CORS origins", () => {
    expect(validateEnv({ ...base, CORS_ALLOWED_ORIGINS: "https://a.in, https://b.in" }).CORS_ALLOWED_ORIGINS).toEqual([
      "https://a.in",
      "https://b.in",
    ]);
  });

  it("rejects a missing DATABASE_URL with a readable message", () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it("rejects a non-postgres DATABASE_URL", () => {
    expect(() => validateEnv({ DATABASE_URL: "mysql://x" })).toThrow(/postgres URL/);
  });

  it("rejects an invalid port and unknown CRM adapter", () => {
    expect(() => validateEnv({ ...base, API_PORT: "99999" })).toThrow(/API_PORT/);
    expect(() => validateEnv({ ...base, CRM_ADAPTER: "production-crm" })).toThrow(/CRM_ADAPTER/);
  });
});
