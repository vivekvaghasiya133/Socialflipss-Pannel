"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalInvoices = dynamic(
  () => import("../../../views/portal/PortalPages").then((mod) => mod.PortalInvoices),
  { ssr: false }
);

export default function PortalInvoicesRoute() {
  return <PortalInvoices />;
}
