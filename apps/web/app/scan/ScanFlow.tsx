"use client";

// Briefing flow: QR scan → login (name + mobile + OTP) → BMI projects →
// Interested? yes → enquiry form → thank you | no → IK Developers projects.
// Front end only: OTP is in demo mode and nothing is saved or sent.

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { OtpStep, SuccessStamp } from "@/components/OtpFlow";
import { authClient } from "@/lib/auth-client";
import { isValidEmail, normaliseIndianMobile } from "@/lib/phone";
import { BMI_PROJECTS, IK_PROJECTS, type BriefProject } from "@/lib/brief";

type Step = "login" | "otp" | "projects" | "form" | "thanks" | "ik";

export function ScanFlow() {
  const fromQr = useSearchParams().get("src") === "qr";
  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const e164 = normaliseIndianMobile(phone);
  const first = name.trim().split(" ")[0];

  return (
    <div className="brief">
      <header className="brief-top">
        <LogoMark size={34} />
        <span>BMI Housing Society</span>
      </header>

      <main className="brief-main">
        {step === "login" && (
          <form
            className="brief-card"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              if (name.trim().length < 2) return setError("Please enter your name.");
              if (!e164) return setError("Enter a valid 10-digit mobile number.");
              setError(null);
              setBusy(true);
              await authClient.requestOtp({ phoneE164: e164, name: name.trim(), intent: "register" });
              setBusy(false);
              setStep("otp");
            }}
          >
            {fromQr && <p className="brief-badge">📍 You scanned a BMI QR code</p>}
            <h1>Welcome</h1>
            <p className="lede">Sign in with your mobile number to see our projects.</p>
            <label className="field">
              <span className="field-label">Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
            </label>
            <label className="field">
              <span className="field-label">Mobile number</span>
              <div className="phone-input">
                <span className="prefix">+91</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" />
              </div>
            </label>
            {error && <p className="field-error" role="alert">{error}</p>}
            <button className="btn btn-lg btn-block" disabled={busy}>{busy ? "Sending code…" : "Get OTP"}</button>
          </form>
        )}

        {step === "otp" && e164 && (
          <div className="brief-card">
            <h1>Verify mobile</h1>
            <OtpStep phoneE164={e164} onVerified={() => setStep("projects")} onBack={() => setStep("login")} />
          </div>
        )}

        {step === "projects" && (
          <>
            <h1 className="brief-h">Hi {first}, here are our projects</h1>
            <ProjectList projects={BMI_PROJECTS} />
            <div className="brief-card brief-ask">
              <h2>Are you interested?</h2>
              <div className="brief-choice">
                <button className="btn btn-lg" onClick={() => setStep("form")}>Yes, I'm interested</button>
                <button className="btn btn-ghost btn-lg" onClick={() => setStep("ik")}>Not interested</button>
              </div>
            </div>
          </>
        )}

        {step === "form" && <InterestForm name={name} onDone={() => setStep("thanks")} onBack={() => setStep("projects")} />}

        {step === "thanks" && (
          <div className="brief-card">
            <SuccessStamp title={`Thank you, ${first}!`}>
              <p className="lede">Our team will contact you shortly.</p>
              <p className="demo-note">Demo: this form is not saved or sent yet.</p>
            </SuccessStamp>
          </div>
        )}

        {step === "ik" && (
          <>
            <h1 className="brief-h">No problem. Explore projects by IK Developers</h1>
            <ProjectList projects={IK_PROJECTS} />
            <button className="link-btn" onClick={() => setStep("projects")}>← Back to BMI projects</button>
          </>
        )}
      </main>
    </div>
  );
}

function ProjectList({ projects }: { projects: BriefProject[] }) {
  return (
    <div className="brief-projects">
      {projects.map((p) => (
        <article key={p.id} className={`brief-project hue-${p.hue}`}>
          <div className="brief-project-art" aria-hidden="true">
            <svg viewBox="0 0 120 60">
              <path d="M8 52 H112 V30 L60 8 L8 30Z" />
              <path d="M60 52 V30 M8 41 H112" className="sub" />
            </svg>
          </div>
          <div className="brief-project-body">
            <h2>{p.name}</h2>
            <p className="tagline">{p.tagline}</p>
            <p className="muted">⌖ {p.location}</p>
            <ul>{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
        </article>
      ))}
    </div>
  );
}

function InterestForm({ name, onDone, onBack }: { name: string; onDone: () => void; onBack: () => void }) {
  const [project, setProject] = useState(BMI_PROJECTS[0].id);
  const [email, setEmail] = useState("");
  const [size, setSize] = useState("");
  const [visit, setVisit] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="brief-card"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (email && !isValidEmail(email)) return setError("That email doesn't look right.");
        onDone();
      }}
    >
      <h1>Tell us a little more</h1>
      <p className="lede">{name.trim()}, we'll use this to help you faster.</p>
      <label className="field">
        <span className="field-label">Project</span>
        <select value={project} onChange={(e) => setProject(e.target.value)}>
          {BMI_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Email <em>Optional</em></span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <label className="field">
        <span className="field-label">Preferred plot size <em>Optional</em></span>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="">Not sure yet</option>
          <option>Small</option>
          <option>Medium</option>
          <option>Large</option>
        </select>
      </label>
      <label className="field">
        <span className="field-label">Preferred site-visit date <em>Optional</em></span>
        <input type="date" value={visit} onChange={(e) => setVisit(e.target.value)} />
      </label>
      <label className="field">
        <span className="field-label">Message <em>Optional</em></span>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything we should know?" />
      </label>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button className="btn btn-lg btn-block">Submit</button>
      <p className="switch"><button type="button" className="link-btn" onClick={onBack}>← Back</button></p>
    </form>
  );
}
