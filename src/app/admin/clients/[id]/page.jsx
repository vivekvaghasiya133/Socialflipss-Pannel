"use client";

import React from "react";
import dynamic from "next/dynamic";

const ClientDetail = dynamic(() => import("../../../../views/admin/ClientDetail"), {
  ssr: false,
});

export default function ClientDetailRoute() {
  return <ClientDetail />;
}
