"use client";

import React from "react";
import dynamic from "next/dynamic";

const AutoInvoicePage = dynamic(() => import("../../../views/admin/AutoInvoicePage"), {
  ssr: false,
});

export default function AutoInvoiceRoute() {
  return <AutoInvoicePage />;
}
