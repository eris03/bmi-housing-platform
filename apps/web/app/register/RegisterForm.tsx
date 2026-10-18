"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isValidEmail, normaliseIndianMobile } from "@/lib/phone";
import { getProject } from "@/lib/projects";
import { parseAttribution } from "@/lib/attribution";
import { OtpStep, SuccessStamp } from "@/components/OtpFlow";

type Step = "details" | "otp" | "done";

export function RegisterForm() {
  const sp = useSearchParams();
  const project = getProject(sp.get("project") ?? "");
  const plot = sp.get("plot");
  const attribution = parseAttribution({ src: sp.get("src"), cmp: sp.get("cmp") });

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const phoneE164 = normaliseIndianMobile(phone);
  const errors = {
    name: name.trim().length < 2 ? "Please enter your name." : null,
    phone: !phoneE164 ? "Enter a valid 10-digit Indian mobile number." : null,
    email: email && !isValidEmail(email) ? "That email doesn't look right." : null,
  };
  const valid = !errors.name && !errors.phone && !errors.email;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || !phoneE164) return;
    setBusy(true);
    await authClient.requestOtp({ phoneE164, name: name.trim(), email: email || undefined, intent: "register" });
    setBusy(false);
    setStep("otp");
  }

  return (
    <div className="auth-card">
      <Stepper step={step} />
      {project && step !== "done" && (
        <div className="context-pill">
          Enquiring about <strong>{project.name}</strong>
          {plot && <> · Plot {plot}</>}
          {attribution.source === "QR_CODE" && <span className="via">via QR</span>}
        </div>
      )}

      {step === "details" && (
        <form onSubmit={onSubmit} noValidate>
          <h1>Let's get to know you</h1>
          <p className="lede">Three quick details. We'll verify your mobile with a one-time code.</p>

          <Field label="Full name" error={touched ? errors.name : null}>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Asha Verma" />
          </Field>
          <Field label="Mobile number" error={touched ? errors.phone : null}>
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
          </Field>
          <Field label="Email" hint="Optional" error={touched ? errors.email : null}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" />
          </Field>

          <label className="check">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>BMI Housing Society may contact me about my enquiry by call or SMS. (Optional — final wording pending approval.)</span>
          </label>

          <button className="btn btn-lg btn-block" disabled={busy}>
            {busy ? "Sending code…" : "Send verification code"}
          </button>
          <p className="switch">
            Already registered? <Link href="/login">Sign in</Link>
          </p>
        </form>
      )}

      {step === "otp" && phoneE164 && (
        <>
          <h1>Verify your mobile</h1>
          <OtpStep phoneE164={phoneE164} onVerified={() => setStep("done")} onBack={() => setStep("details")} />
        </>
      )}

      {step === "done" && (
        <SuccessStamp title={`Welcome, ${name.trim().split(" ")[0]}!`}>
          <p className="lede">
            {project
              ? `Your interest in ${project.name} is noted. Our team will reach out soon.`
              : "Your account is ready. Explore projects at your own pace."}
          </p>
          {authClient.isDemo && (
            <p className="demo-note">Demo mode: nothing was saved and no enquiry was sent. This step goes live with the API.</p>
          )}
          <Link className="btn btn-lg" href={project ? `/p/${project.slug}` : "/projects"}>
            {project ? "Back to project" : "Explore projects"}
          </Link>
        </SuccessStamp>
      )}
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: React.ReactNode }) {
  return (
    <label className={`field ${error ? "has-error" : ""}`}>
      <span className="field-label">
        {label} {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  );
}

function Stepper({ step }: { step: Step }) {
  const idx = { details: 0, otp: 1, done: 2 }[step];
  return (
    <ol className="stepper" aria-label="Progress">
      {["Details", "Verify", "Done"].map((s, i) => (
        <li key={s} className={i <= idx ? "on" : ""} aria-current={i === idx ? "step" : undefined}>
          <span>{i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}
