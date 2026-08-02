import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { getCurrentUser } from "@/lib/auth";
import Navigation from "@/components/navigation";
import Toaster from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lavender Auto Parts — Purchase Orders",
  description:
    "Internal purchase order management system for Lavender Auto Parts.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navigation user={auth ? { name: auth.user.name, email: auth.user.email, role: auth.role } : null} />
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
