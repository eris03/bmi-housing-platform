"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { maskPhone } from "@/lib/phone";

/** Six-box OTP entry with resend timer. Calls onVerified on success. */
export function OtpStep({ phoneE164, onVerified, onBack }: { phoneE164: string; onVerified: () => void; onBack: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function submit(code: string) {
    setBusy(true);
    setError(null);
    const res = await authClient.verifyOtp(phoneE164, code);
    setBusy(false);
    if (res.ok) onVerified();
    else {
      setError(res.error ?? "Verification failed.");
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
    }
  }

  function setAt(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      // pasted full code
      const next = clean.slice(0, 6).split("");
      const filled = [...next, ...Array(6 - next.length).fill("")];
      setDigits(filled);
      if (next.length === 6) submit(next.join(""));
      else refs.current[next.length]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d)) submit(next.join(""));
  }

  return (
    <div className="otp-step">
      <p className="lede">
        Enter the 6-digit code sent to <strong>{maskPhone(phoneE164)}</strong>
      </p>
      {authClient.isDemo && (
        <p className="demo-note" role="note">
          Demo mode: no SMS is sent and no account is created. Use code <code>{authClient.demoCode}</code>.
        </p>
      )}
      <div className="otp-boxes" role="group" aria-label="One-time code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={6}
            placeholder="·"
            value={d}
            aria-label={`Digit ${i + 1}`}
            disabled={busy}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
            }}
          />
        ))}
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="otp-actions">
        <button type="button" className="link-btn" onClick={onBack}>Change number</button>
        <button
          type="button"
          className="link-btn"
          disabled={wait > 0}
          onClick={async () => {
            const r = await authClient.requestOtp({ phoneE164, intent: "login" });
            setWait(r.resendAfterSeconds);
          }}
        >
          {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}

export function SuccessStamp({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="success">
      <svg viewBox="0 0 120 120" className="stamp" aria-hidden="true">
        <circle cx="60" cy="60" r="52" />
        <path d="M30 66 H90 V52 L60 30 L30 52Z" className="stamp-house" />
        <path d="M44 62 L56 72 L78 48" className="stamp-check" />
      </svg>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
