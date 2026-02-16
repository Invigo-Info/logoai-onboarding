import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Logo.ai",
  description:
    "Tell us about your brand and style preferences so we can create the perfect logo for you.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
