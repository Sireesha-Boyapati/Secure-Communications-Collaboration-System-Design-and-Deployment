import { apiFetch } from "./client";
import type { AuthResponse, User } from "../types";

export async function requestOtp(email: string): Promise<void> {
  await apiFetch<void>(
    "/api/auth/otp/request",
    { method: "POST", body: JSON.stringify({ email }) },
    false,
  );
}

export async function verifyOtp(
  email: string,
  code: string,
  displayName: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    "/api/auth/otp/verify",
    {
      method: "POST",
      body: JSON.stringify({ email, code, display_name: displayName }),
    },
    false,
  );
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}
