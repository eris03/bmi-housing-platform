import { describe, expect, it } from "vitest";
import { attributionQuery, buildProjectUrl, parseAttribution } from "@/lib/attribution";

describe("parseAttribution", () => {
  it("maps qr short code", () =>
    expect(parseAttribution({ src: "qr", cmp: "board-1" })).toEqual({ source: "QR_CODE", campaignId: "board-1" }));
  it("defaults to WEBSITE", () => expect(parseAttribution({})).toEqual({ source: "WEBSITE", campaignId: null }));
  it("drops unsafe campaign ids", () => expect(parseAttribution({ src: "qr", cmp: "<script>" }).campaignId).toBeNull());
  it("ignores unknown sources", () => expect(parseAttribution({ src: "evil" }).source).toBe("WEBSITE"));
});

describe("buildProjectUrl", () => {
  it("builds a QR-tagged project link", () =>
    expect(buildProjectUrl("https://bmi.example", "greenfield", "gate-a")).toBe(
      "https://bmi.example/p/greenfield?src=qr&cmp=gate-a",
    ));
  it("omits an invalid campaign", () =>
    expect(buildProjectUrl("https://bmi.example", "greenfield", "bad tag")).toBe(
      "https://bmi.example/p/greenfield?src=qr",
    ));
});

describe("attributionQuery", () => {
  it("carries QR attribution into registration", () =>
    expect(attributionQuery("greenfield", { source: "QR_CODE", campaignId: "gate-a" })).toBe(
      "project=greenfield&src=qr&cmp=gate-a",
    ));
});

import { buildScanUrl } from "@/lib/attribution";
describe("buildScanUrl", () => {
  it("links to the briefing flow", () =>
    expect(buildScanUrl("https://bmi.example", "gate-a")).toBe("https://bmi.example/scan?src=qr&cmp=gate-a"));
});
