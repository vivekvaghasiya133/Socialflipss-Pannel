"use client";

import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "../context/AuthContext";
import theme from "../theme";

export function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
