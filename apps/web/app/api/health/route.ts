// Liveness for the web app (used by Docker Compose and hosting health checks).
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", service: "web", time: new Date().toISOString() });
}
