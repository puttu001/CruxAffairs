const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function post(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    post("/auth/register", body),

  login: (body: { email: string; password: string }) =>
    post("/auth/login", body),

  forgotPassword: (email: string) =>
    post("/auth/forgot-password", { email }),

  resetPassword: (token: string, new_password: string) =>
    post("/auth/reset-password", { token, new_password }),

  googleAuth: (token: string) =>
    post("/auth/google", { token }),

  verifyEmail: (email: string, otp: string) =>
    post("/auth/verify-email", { email, otp }),

  resendVerification: (email: string) =>
    post("/auth/resend-verification", { email }),
};
