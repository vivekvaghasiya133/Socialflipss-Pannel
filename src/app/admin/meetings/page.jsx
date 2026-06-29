"use client";

import React from "react";
import dynamic from "next/dynamic";

const MeetingsPage = dynamic(() => import("../../../views/MeetingsPage"), {
  ssr: false,
});

export default function MeetingsRoute() {
  return <MeetingsPage />;
}
