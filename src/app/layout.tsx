import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const appFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Metropolis | Specialist Doctor Chambers & Precision Diagnostics",
  description: "Consult leading specialist doctors in Cardiology, Neurology, Diabetology, and more. NABL & ISO 15189 accredited diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={appFont.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
