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
      <div className="auth-card">
        <h1>StudySafe</h1>
        <p className="subtitle">Encrypted team chat — sign in with email OTP</p>

        {step === "email" ? (
          <form onSubmit={(e) => void handleRequestOtp(e)}>
            <label>
              College email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.ie"
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void handleVerifyOtp(e)}>
            <p className="hint">Code sent to <strong>{email}</strong> (check backend logs in dev)</p>
            <label>
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alice"
                required
              />
            </label>
            <label>
              Verification code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Verifying…" : "Verify & sign in"}
            </button>
            <button type="button" className="btn-link" onClick={() => setStep("email")}>
              Use different email
            </button>
          </form>
        )}

        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
}
