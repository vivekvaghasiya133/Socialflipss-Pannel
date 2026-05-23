"use client";

import React from "react";
import dynamic from "next/dynamic";

const ProjectsPage = dynamic(() => import("../../../views/ProjectsPage"), {
  ssr: false,
});

export default function ProjectsRoute() {
  return <ProjectsPage />;
}
