import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { testConnection } from "./config/db.js";

// Import API Routers
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import bankAccountRoutes from "./routes/bankAccountRoutes.js";

import os from "os";

export function createServer() {
  const app = express();

  // Test koneksi database saat startup
  testConnection();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static route untuk upload gambar produk & bukti bayar
  const isServerless = process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT || process.env.NODE_ENV === "production";
  const uploadDir = isServerless ? path.join(os.tmpdir(), "uploads") : path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadDir));

  // Register API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/shipments", shipmentRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/admin/dashboard", dashboardRoutes);
  app.use("/api/bank-accounts", bankAccountRoutes);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/db-test", async (_req, res) => {
    try {
      const { default: pool } = await import("./config/db.js");
      const [rows] = await pool.query("SELECT 1 + 1 as result");
      res.json({
        success: true,
        message: "Database connected successfully!",
        db_host: process.env.DB_HOST,
        db_name: process.env.DB_NAME,
        db_user: process.env.DB_USER,
        result: rows[0].result
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Database connection failed!",
        error: err.message,
        db_host: process.env.DB_HOST,
        db_name: process.env.DB_NAME,
        db_user: process.env.DB_USER
      });
    }
  });

  app.get("/api/demo", handleDemo);

  return app;
}

