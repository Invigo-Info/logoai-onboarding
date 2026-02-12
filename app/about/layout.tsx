import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Logo.ai",
  description:
    "The story behind Logo.ai — built by serial entrepreneurs on a mission to make great branding accessible to everyone.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
