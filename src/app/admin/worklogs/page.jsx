"use client";

import React from "react";
import dynamic from "next/dynamic";

const WorkLogsPage = dynamic(() => import("../../../views/WorkLogsPage"), {
  ssr: false,
});

export default function WorklogsRoute() {
  return <WorkLogsPage />;
}
