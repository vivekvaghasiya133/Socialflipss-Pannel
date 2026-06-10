"use client";

import React from "react";
import dynamic from "next/dynamic";

const SopLibraryPage = dynamic(() => import("../../../views/SopLibraryPage"), {
  ssr: false,
});

export default function SopLibraryRoute() {
  return <SopLibraryPage />;
}
