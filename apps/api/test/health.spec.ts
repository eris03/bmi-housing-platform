process.env.DATABASE_URL ??= "postgresql://stub:stub@localhost:1/stub";
process.env.LOG_LEVEL = "silent";
process.env.NODE_ENV = "test";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/app.factory";
import { PrismaService } from "../src/prisma/prisma.service";

// HTTP-level tests with the database replaced by a stub, so they run without Postgres.
async function build(queryRaw: () => Promise<unknown>): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({ $queryRaw: queryRaw, $disconnect: async () => undefined })
    .compile();
  const app = configureApp(moduleRef.createNestApplication({ bufferLogs: true }));
  await app.init();
  return app;
}

describe("health endpoints", () => {
  let app: INestApplication;
  afterEach(async () => app?.close());

  it("GET /api/v1/health/live → 200 without touching the database", async () => {
    const db = jest.fn();
    app = await build(db);
    const res = await request(app.getHttpServer()).get("/api/v1/health/live").expect(200);
    expect(res.body.status).toBe("ok");
    expect(db).not.toHaveBeenCalled();
  });

  it("GET /api/v1/health/ready → 200 when the database answers", async () => {
    app = await build(async () => [{ "?column?": 1 }]);
    const res = await request(app.getHttpServer()).get("/api/v1/health/ready").expect(200);
    expect(res.body.checks.database.status).toBe("up");
  });

  it("GET /api/v1/health/ready → 503 when the database is down", async () => {
    app = await build(async () => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
    });
    const res = await request(app.getHttpServer()).get("/api/v1/health/ready").expect(503);
    expect(res.body.status).toBe("error");
    expect(res.body.checks.database).toEqual({ status: "down", detail: "connect ECONNREFUSED 127.0.0.1:5432" });
  });

  it("echoes a valid x-correlation-id and generates one otherwise", async () => {
    app = await build(async () => [1]);
    const a = await request(app.getHttpServer()).get("/api/v1/health/live").set("x-correlation-id", "abc-123");
    expect(a.headers["x-correlation-id"]).toBe("abc-123");
    const b = await request(app.getHttpServer())
      .get("/api/v1/health/live")
      .set("x-correlation-id", "bad id with spaces");
    expect(b.headers["x-correlation-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("sets security headers", async () => {
    app = await build(async () => [1]);
    const res = await request(app.getHttpServer()).get("/api/v1/health/live");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
