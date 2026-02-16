import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Logo.ai",
  description:
    "How Logo.ai collects, uses, and protects your information. Your privacy matters to us.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
