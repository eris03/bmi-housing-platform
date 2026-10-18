// Auth client boundary. The real implementation will call the API's
// OTP endpoints (Milestone 02/03). Until then DemoAuthClient is used and the
// UI shows a visible "demo mode" notice. No SMS is sent and no account is created.

export interface OtpRequest {
  phoneE164: string;
  name?: string;
  email?: string;
  intent: "register" | "login";
}

export interface AuthClient {
  readonly isDemo: boolean;
  requestOtp(req: OtpRequest): Promise<{ resendAfterSeconds: number }>;
  verifyOtp(phoneE164: string, code: string): Promise<{ ok: boolean; error?: string }>;
}

const DEMO_CODE = "123456";

export class DemoAuthClient implements AuthClient {
  readonly isDemo = true;
  readonly demoCode = DEMO_CODE;

  async requestOtp(_req: OtpRequest): Promise<{ resendAfterSeconds: number }> {
    await new Promise((r) => setTimeout(r, 600));
    return { resendAfterSeconds: 30 };
  }

  async verifyOtp(_phone: string, code: string) {
    await new Promise((r) => setTimeout(r, 500));
    return code === DEMO_CODE ? { ok: true } : { ok: false, error: "That code doesn't match. Try again." };
  }
}

export const authClient = new DemoAuthClient();
