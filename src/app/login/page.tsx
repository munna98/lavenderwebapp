import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign In — Lavender Auto Parts",
  description: "Sign in to the Lavender Auto Parts system.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: "var(--accent-soft)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
            Lavender Auto Parts
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Sign in to manage operations
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6 border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
