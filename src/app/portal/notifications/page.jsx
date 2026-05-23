"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalNotifications = dynamic(
  () => import("../../../views/portal/PortalPages").then((mod) => mod.PortalNotifications),
  { ssr: false }
);

export default function PortalNotificationsRoute() {
  return <PortalNotifications />;
}
