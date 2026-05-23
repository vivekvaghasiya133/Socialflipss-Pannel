"use client";

import React from "react";
import dynamic from "next/dynamic";

const StaffLeaveForm = dynamic(() => import("../../../views/StaffLeaveForm"), {
  ssr: false,
});

export default function LeaveFormRoute() {
  return <StaffLeaveForm />;
}
