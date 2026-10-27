import type { Theme } from "theme-ui";

const theme: Theme = {
  fonts: {
    body: "Inter, Arial, sans-serif",
    heading: "Inter, Arial, sans-serif",
  },
  colors: {
    text: "#1a1a1a",
    background: "#fbf7f3",
    primary: "#8b4533",
    muted: "#555555",
    error: "#d32f2f",
    success: "#2e7d32",
    border: "#e8dfd8",
    activeBg: "#f3e6e0",
    tableHead: "#f3e6dc",
  },
  radii: { pill: 24, card: 28 },

  buttons: {
    primary: {
      width: "100%",
      py: 3,
      cursor: "pointer",
      fontWeight: 600,
      color: "white",
      borderRadius: "pill",
      background: "linear-gradient(90deg, #a65d4a, #8b4533)",
      "&:disabled": { opacity: 0.7, cursor: "not-allowed" },
    },
    secondary: {
      cursor: "pointer",
      py: 3,
      fontWeight: 600,
      color: "primary",
      bg: "white",
      borderRadius: "pill",
      border: "1px solid",
      borderColor: "border",
      "&:disabled": { opacity: 0.7, cursor: "not-allowed" },
    },
    danger: {
      cursor: "pointer",
      py: 3,
      fontWeight: 600,
      color: "white",
      bg: "error",
      borderRadius: "pill",
      "&:disabled": { opacity: 0.7, cursor: "not-allowed" },
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      width: "100%",
      px: 3,
      py: 2,
      bg: "transparent",
      color: "text",
      fontWeight: 500,
      textAlign: "left",
      cursor: "pointer",
      borderRadius: 8,
      "&:hover": { bg: "activeBg" },
    },
  },

  forms: {
    input: {
      bg: "white",
      px: 3,
      borderRadius: "pill",
      borderColor: "#dcd5ce",
      "&:focus": { borderColor: "primary", outline: "none" },
    },
    label: { fontSize: 1, fontWeight: 500, mb: 1 },
    select: {
      bg: "white",
      px: 3,
      borderRadius: "pill",
      borderColor: "#dcd5ce",
      "&:focus": { borderColor: "primary", outline: "none" },
    },
  },

  alerts: {
    primary: {
      bg: "#fdecea",
      color: "error",
      borderRadius: 8,
      mb: 3,
      fontSize: 1,
    },
    success: {
      bg: "#e8f5e9",
      color: "success",
      borderRadius: 8,
      mb: 3,
      fontSize: 1,
    },
  },
};

export default theme;
