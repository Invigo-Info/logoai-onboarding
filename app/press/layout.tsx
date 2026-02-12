import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press Kit — Logo.ai",
  description:
    "Press kit for Logo.ai — the AI logo generator launching March 2026.",
};

export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
