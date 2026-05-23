"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";
import { OutletProvider } from "../../compat/react-router-dom";

const DashboardLayout = dynamic(() => import("../../components/admin/DashboardLayout"), {
  ssr: false,
});

export default function AdminLayoutWrapper({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <OutletProvider value={children}>
      <DashboardLayout />
    </OutletProvider>
  );
}
