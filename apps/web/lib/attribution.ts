// QR / campaign attribution carried on project URLs.
// Client-side parsing only shapes the value; the API must validate campaign IDs
// against its own records before trusting them.

export const LEAD_SOURCES = [
  "ANDROID_APP",
  "QR_CODE",
  "META_AD",
  "WEBSITE",
  "PHONE",
  "STAFF_CREATED",
  "OTHER",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

const SHORT_SOURCES: Record<string, LeadSource> = {
  qr: "QR_CODE",
  app: "ANDROID_APP",
  web: "WEBSITE",
  meta: "META_AD",
};

export interface Attribution {
  source: LeadSource;
  campaignId: string | null;
}

const CAMPAIGN_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export function parseAttribution(params: { src?: string | null; cmp?: string | null }): Attribution {
  const source = (params.src && SHORT_SOURCES[params.src.toLowerCase()]) || "WEBSITE";
  const campaignId = params.cmp && CAMPAIGN_RE.test(params.cmp) ? params.cmp : null;
  return { source, campaignId };
}

export function buildProjectUrl(siteUrl: string, slug: string, campaign?: string): string {
  const url = new URL(`/p/${encodeURIComponent(slug)}`, siteUrl);
  url.searchParams.set("src", "qr");
  if (campaign && CAMPAIGN_RE.test(campaign)) url.searchParams.set("cmp", campaign);
  return url.toString();
}

/** Carries attribution through to registration/enquiry. */
export function attributionQuery(slug: string, a: Attribution): string {
  const q = new URLSearchParams({ project: slug });
  if (a.source === "QR_CODE") q.set("src", "qr");
  if (a.campaignId) q.set("cmp", a.campaignId);
  return q.toString();
}

/** QR link into the sign-in → projects briefing flow. */
export function buildScanUrl(siteUrl: string, campaign?: string): string {
  const url = new URL("/scan", siteUrl);
  url.searchParams.set("src", "qr");
  if (campaign && CAMPAIGN_RE.test(campaign)) url.searchParams.set("cmp", campaign);
  return url.toString();
}
