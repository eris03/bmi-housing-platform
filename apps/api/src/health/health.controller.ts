import { Controller, Get, HttpCode, HttpStatus, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import type { HealthResponse } from "@bmi/contracts";
import { PrismaService } from "../prisma/prisma.service";
import type { Env } from "../config/env";

const VERSION = process.env.npm_package_version ?? "0.1.0";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** Liveness: the process is running. Never touches dependencies. */
  @Get("live")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Process is alive" })
  live(): HealthResponse {
    return { status: "ok", version: VERSION, time: new Date().toISOString() };
  }

  /** Readiness: required dependencies answer. The CRM is not required. */
  @Get("ready")
  @ApiOkResponse({ description: "Ready to serve traffic" })
  @ApiServiceUnavailableResponse({ description: "A required dependency is unavailable" })
  async ready(@Res({ passthrough: true }) res: Response): Promise<HealthResponse> {
    const timeout = this.config.get("READINESS_DB_TIMEOUT_MS", { infer: true });
    let database: { status: "up" | "down"; detail?: string };
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`timed out after ${timeout}ms`)), timeout);
        }),
      ]);
      database = { status: "up" };
    } catch (e) {
      database = {
        status: "down",
        detail:
          (e instanceof Error &&
            e.message
              .split("\n")
              .map((l) => l.trim())
              .find(Boolean)) ||
          "database unavailable",
      };
    }
    clearTimeout(timer);
    const ok = database.status === "up";
    res.status(ok ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return {
      status: ok ? "ok" : "error",
      checks: {
        database,
        crm: { status: "up", detail: `${this.config.get("CRM_ADAPTER", { infer: true })} adapter (not required)` },
      },
      version: VERSION,
      time: new Date().toISOString(),
    };
  }
}
