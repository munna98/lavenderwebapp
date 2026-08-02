"use client";

import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      duration={4000}
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--foreground)",
          borderColor: "var(--border)",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          boxShadow: "var(--shadow-md)",
        },
      }}
    />
  );
}
