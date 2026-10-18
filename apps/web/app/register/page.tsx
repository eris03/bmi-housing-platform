import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AuthShell>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
