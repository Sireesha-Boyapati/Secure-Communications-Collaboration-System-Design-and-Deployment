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
    <div className="auth-page realtime-bg">
      <div className="auth-glow auth-glow-a" aria-hidden />
      <div className="auth-glow auth-glow-b" aria-hidden />
      <div className="auth-glow auth-glow-c" aria-hidden />

      <div className="auth-card glass">
        <div className="auth-brand-row">
          <div className="auth-logo-sm" aria-hidden>
            <span className="live-dot" />
          </div>
          <div>
            <h1>StudySafe</h1>
            <p className="auth-live-tag">Live encrypted messaging</p>
          </div>
        </div>

        <h2>{step === "email" ? "Sign in to chat" : "Enter verification code"}</h2>
        <p className="auth-subtitle">
          {step === "email"
            ? "We’ll email you a one-time code — no password needed."
            : `Code sent to ${email}. Check inbox and spam.`}
        </p>

        {step === "email" ? (
          <form onSubmit={(e) => void handleRequestOtp(e)}>
            <label>
              Email
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
              {loading ? "Sending…" : "Send code & continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void handleVerifyOtp(e)}>
            <label>
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Name in chat"
                autoComplete="name"
                required
              />
            </label>
            <label>
              6-digit code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </label>
            <button type="submit" className="btn-cta" disabled={loading}>
              {loading ? "Joining…" : "Join realtime chat"}
            </button>
            <button type="button" className="btn-text" onClick={() => setStep("email")}>
              Different email
            </button>
          </form>
        )}

        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
}
