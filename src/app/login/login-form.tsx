"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setIsLoading(false);
      setErrorMsg("Invalid email or password. Please check your credentials.");
    } else {
      router.push("/po");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--foreground)" }}
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@lavenderautoparts.com"
          required
          disabled={isLoading}
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all focus:border-accent"
          style={{
            background: "var(--surface)",
            borderColor: errorMsg ? "#EF4444" : "var(--border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--foreground)" }}
        >
          Password
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="w-full pl-3 pr-10 py-2.5 rounded-lg text-sm border outline-none transition-all focus:border-accent"
            style={{
              background: "var(--surface)",
              borderColor: errorMsg ? "#EF4444" : "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPassword((prev) => !prev);
            }}
            className="absolute right-2.5 p-1 rounded hover:bg-surface-raised transition-colors cursor-pointer select-none"
            style={{ color: "var(--muted-foreground)" }}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              /* Eye Off Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* Eye Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <p className="text-xs font-medium" style={{ color: "#EF4444" }}>
          {errorMsg}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        id="login-submit"
        disabled={isLoading || !email.trim() || !password}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--accent)",
          color: "#FFFFFF",
        }}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <svg
              className="animate-spin"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Signing in…
          </span>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
