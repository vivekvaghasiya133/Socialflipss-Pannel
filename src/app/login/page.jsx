"use client";

import React from "react";
import dynamic from "next/dynamic";

const LoginPage = dynamic(() => import("../../views/LoginPage"), {
  ssr: false,
});

export default function LoginRoute() {
  return <LoginPage />;
}
