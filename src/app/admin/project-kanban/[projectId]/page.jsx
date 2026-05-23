"use client";

import React from "react";
import dynamic from "next/dynamic";

const ProjectKanban = dynamic(() => import("../../../../views/ProjectKanban"), {
  ssr: false,
});

export default function ProjectKanbanRoute() {
  return <ProjectKanban />;
}
