"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalInvoiceDetail = dynamic(
  () => import("../../../../views/portal/PortalPages").then((mod) => mod.PortalInvoiceDetail),
  { ssr: false }
);

export default function PortalInvoiceDetailRoute() {
  return <PortalInvoiceDetail />;
}
