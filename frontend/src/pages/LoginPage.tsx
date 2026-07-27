import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp, verifyOtp } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestOtp(email);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await verifyOtp(email, code, displayName);
      login(result.access_token, result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <aside className="auth-showcase">
          <div className="auth-showcase-inner">
            <div className="auth-logo-lg" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1>StudySafe</h1>
            <p className="auth-tagline">Enterprise-grade encrypted collaboration for teams that cannot trust the server.</p>
            <ul className="auth-features">
              <li>End-to-end encryption in the browser</li>
              <li>Two-way key fingerprint verification</li>
              <li>Realtime WebSocket with presence</li>
              <li>Automatic key rotation on join/leave</li>
            </ul>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-brand-row mobile-only">
            <div className="auth-logo-sm" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="22" height="22">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h1>StudySafe</h1>
              <p className="auth-live-tag">Secure team messaging</p>
            </div>
          </div>

          <h2>{step === "email" ? "Sign in" : "Verify your email"}</h2>
          <p className="auth-subtitle">
            {step === "email"
              ? "Passwordless login — we send a one-time code to your inbox."
              : `Enter the 6-digit code sent to ${email}.`}
          </p>

          {step === "email" ? (
            <form onSubmit={(e) => void handleRequestOtp(e)}>
              <label>
                Work email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.ie"
                  autoComplete="email"
                  required
                />
              </label>
              <button type="submit" className="btn-cta" disabled={loading}>
                {loading ? "Sending code…" : "Continue with email"}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => void handleVerifyOtp(e)}>
              <label>
                Display name
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How teammates see you"
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                Verification code
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                />
              </label>
              <button type="submit" className="btn-cta" disabled={loading}>
                {loading ? "Signing in…" : "Enter workspace"}
              </button>
              <button type="button" className="btn-text" onClick={() => setStep("email")}>
                Use a different email
              </button>
            </form>
          )}

          {error && <div className="error-box">{error}</div>}

          <p className="auth-footer-note">Plaintext never reaches our servers · AES-256-GCM · ECDH P-256</p>
        </div>
      </div>
    </div>
  );
}
