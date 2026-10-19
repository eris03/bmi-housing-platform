import { type INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import type { Env } from "./config/env";

/** Applies the global HTTP setup. Shared by main.ts and the e2e tests. */
export function configureApp(app: INestApplication): INestApplication {
  const config = app.get(ConfigService<Env, true>);
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({ origin: config.get("CORS_ALLOWED_ORIGINS", { infer: true }), credentials: true });
  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();

  if (config.get("NODE_ENV", { infer: true }) !== "production") {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle("BMI Housing Platform API").setVersion("1").build(),
    );
    SwaggerModule.setup("api/docs", app, doc);
  }
  return app;
}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  return configureApp(app);
}
