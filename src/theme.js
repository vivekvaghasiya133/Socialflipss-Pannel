import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary:   { main: "#1a56db", light: "#e8f0fe", dark: "#1240a8" },
    secondary: { main: "#0e9f6e", light: "#dcfce7", dark: "#057a55" },
    error:     { main: "#e02424" },
    warning:   { main: "#ff8800" },
    background:{ default: "#f4f6fb", paper: "#ffffff" },
    text:      { primary: "#111928", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderRadius: 12 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
    },
  },
});

export default theme;
