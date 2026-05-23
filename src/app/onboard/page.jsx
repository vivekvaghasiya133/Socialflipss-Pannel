"use client";

import React from "react";
import dynamic from "next/dynamic";

const OnboardingForm = dynamic(() => import("../../views/OnboardingForm"), {
  ssr: false,
});

export default function OnboardRoute() {
  return <OnboardingForm />;
}
