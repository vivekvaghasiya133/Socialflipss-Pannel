"use client";

import React from "react";
import dynamic from "next/dynamic";

const InvoiceDetail = dynamic(() => import("../../../../views/InvoiceDetail"), {
  ssr: false,
});

export default function InvoiceDetailRoute() {
  return <InvoiceDetail />;
}
