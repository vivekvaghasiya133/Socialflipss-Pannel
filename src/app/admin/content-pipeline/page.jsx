"use client";

import React from "react";
import dynamic from "next/dynamic";

const ContentPipelinePage = dynamic(() => import("../../../views/ContentPipelinePage"), {
  ssr: false,
});

export default function ContentPipelineRoute() {
  return <ContentPipelinePage />;
}
