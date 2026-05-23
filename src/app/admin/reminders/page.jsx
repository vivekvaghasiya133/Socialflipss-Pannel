"use client";

import React from "react";
import dynamic from "next/dynamic";

const RemindersPage = dynamic(() => import("../../../views/RemindersPage"), {
  ssr: false,
});

export default function RemindersRoute() {
  return <RemindersPage />;
}
