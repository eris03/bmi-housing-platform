import { Suspense } from "react";
import type { Metadata } from "next";
import { ScanFlow } from "./ScanFlow";

export const metadata: Metadata = { title: "Welcome" };

export default function ScanPage() {
  return (
    <Suspense>
      <ScanFlow />
    </Suspense>
  );
}
