"use client";

import React from "react";
import dynamic from "next/dynamic";

const ClientsPage = dynamic(() => import("../../../views/ClientsPage"), {
  ssr: false,
});

export default function ClientsRoute() {
  return <ClientsPage />;
}
