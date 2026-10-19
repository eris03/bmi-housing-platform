import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { RequestMethod } from "@nestjs/common";
import type { Params } from "nestjs-pino";
import type { Env } from "../config/env";

const ID_RE = /^[A-Za-z0-9._-]{1,128}$/;

/** Structured JSON logs with a correlation id per request; secrets and PII redacted. */
export function loggerParams(env: Env): Params {
  return {
    forRoutes: [{ path: "*path", method: RequestMethod.ALL }],
    pinoHttp: {
      level: env.LOG_LEVEL,
      genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const incoming = req.headers["x-correlation-id"];
        const id = typeof incoming === "string" && ID_RE.test(incoming) ? incoming : randomUUID();
        res.setHeader("x-correlation-id", id);
        return id;
      },
      customProps: (req: IncomingMessage) => ({ correlationId: (req as IncomingMessage & { id: string }).id }),
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          'res.headers["set-cookie"]',
          "*.password",
          "*.token",
          "*.phone",
          "*.email",
        ],
        censor: "[redacted]",
      },
      autoLogging: { ignore: (req: IncomingMessage) => req.url?.startsWith("/api/v1/health/live") ?? false },
      transport: env.NODE_ENV === "development" ? { target: "pino-pretty", options: { singleLine: true } } : undefined,
    },
  };
}
