"use client";

import React from "react";
import dynamic from "next/dynamic";

const AttendancePage = dynamic(() => import("../../../views/AttendancePage"), {
  ssr: false,
});

export default function AttendanceRoute() {
  return <AttendancePage />;
}
