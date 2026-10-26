import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth-user": {
        target: "https://mvp-ecommerce-admin-be-04sm.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
