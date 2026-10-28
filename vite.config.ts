import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth-user": {
        target: "https://mvp-ecommerce-admin-be-04sm.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      "/attribute": {
        target: "https://mvp-ecommerce-admin-be-04sm.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      "/collection": {
        target: "https://mvp-ecommerce-admin-be-04sm.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
