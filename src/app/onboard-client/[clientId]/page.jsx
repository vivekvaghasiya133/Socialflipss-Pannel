"use client";

import React from "react";
import dynamic from "next/dynamic";

const ClientOnboardingForm = dynamic(() => import("../../../views/ClientOnboardingForm"), {
  ssr: false,
});

export default function ClientOnboardRoute() {
  return <ClientOnboardingForm />;
}
