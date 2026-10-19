import "reflect-metadata";
import { ConfigService } from "@nestjs/config";
import { createApp } from "./app.factory";
import type { Env } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const port = app.get(ConfigService<Env, true>).get("API_PORT", { infer: true });
  await app.listen(port);
}

bootstrap().catch((err: unknown) => {
  // Logger may not exist yet (e.g. invalid env), so write directly to stderr.
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
