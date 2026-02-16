import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Logo.ai | AI Logo Generator",
  description:
    "Agencies charge thousands. Logo makers give you templates. We built Logo.ai so anyone can get a great logo — fast, affordable, and original.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
