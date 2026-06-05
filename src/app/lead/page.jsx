"use client";

import dynamic from "next/dynamic";

const OnboardingForm = dynamic(() => import("../../views/OnboardingForm"), {
  ssr: false,
});

export default function LeadRoute() {
  return <OnboardingForm />;
}
