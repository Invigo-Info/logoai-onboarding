import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo.ai Media Kit | Press & Brand Assets",
  description:
    "Download Logo.ai logos, brand assets, and press materials. Everything journalists and partners need to feature the AI logo generator.",
};

export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
