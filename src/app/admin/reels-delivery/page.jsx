"use client";

import React from "react";
import dynamic from "next/dynamic";

const ReelsDeliveryPage = dynamic(() => import("../../../views/ReelsDeliveryPage"), {
  ssr: false,
});

export default function ReelsDeliveryRoute() {
  return <ReelsDeliveryPage />;
}
