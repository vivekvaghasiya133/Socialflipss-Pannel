"use client";

import React from "react";
import dynamic from "next/dynamic";

const InvoicesPage = dynamic(() => import("../../../views/InvoicesPage"), {
  ssr: false,
});

export default function InvoicesRoute() {
  return <InvoicesPage />;
}
