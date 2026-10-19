"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { OtpStep, SuccessStamp } from "@/components/OtpFlow";
import { authClient } from "@/lib/auth-client";
import { normaliseIndianMobile } from "@/lib/phone";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const e164 = normaliseIndianMobile(phone);

  return (
    <AuthShell>
      <div className="auth-card">
        {step === "phone" && (
          <form
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              if (!e164) return setError("Enter a valid 10-digit Indian mobile number.");
              setError(null);
              setBusy(true);
              await authClient.requestOtp({ phoneE164: e164, intent: "login" });
              setBusy(false);
              setStep("otp");
            }}
          >
            <h1>Welcome back</h1>
            <p className="lede">Sign in with your registered mobile number.</p>
            <label className={`field ${error ? "has-error" : ""}`}>
              <span className="field-label">Mobile number</span>
              <div className="phone-input">
                <span className="prefix">+91</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                />
              </div>
              {error && (
                <span className="field-error" role="alert">
                  {error}
                </span>
              )}
            </label>
            <button className="btn btn-lg btn-block" disabled={busy}>
              {busy ? "Sending code…" : "Send code"}
            </button>
            <p className="switch">
              New here? <Link href="/register">Create an account</Link>
            </p>
          </form>
        )}
        {step === "otp" && e164 && (
          <>
            <h1>Enter your code</h1>
            <OtpStep phoneE164={e164} onVerified={() => setStep("done")} onBack={() => setStep("phone")} />
          </>
        )}
        {step === "done" && (
          <SuccessStamp title="You're signed in">
            {authClient.isDemo && <p className="demo-note">Demo mode: no session was created.</p>}
            <Link className="btn btn-lg" href="/projects">
              Go to projects
            </Link>
          </SuccessStamp>
        )}
      </div>
    </AuthShell>
  );
}
