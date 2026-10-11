import express from "express";
import cors from "cors";
import "dotenv/config";
import { pathToFileURL } from "node:url";
import { initDB } from "./config/db.js";

import universitiesRoute from "./routes/universitiesRoute.js";
import coursesRoute from "./routes/coursesRoute.js";
import studentsRoute from "./routes/studentsRoute.js";
import matchingRoute from "./routes/matchingRoute.js";
import authRoute from "./routes/authRoute.js";
import scholarshipsRoute from "./routes/scholarshipsRoute.js";
import teachersRoute from "./routes/teachersRoute.js";
import adminRoute from "./routes/adminRoute.js";
import inquiriesRoute from "./routes/inquiriesRoute.js";
import notificationsRoute from "./routes/notificationsRoute.js";
import studentNotificationsRoute from "./routes/studentNotificationsRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    service: "University Course Matching API",
    timestamp: new Date().toISOString() 
  });
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/universities", universitiesRoute);
app.use("/api/courses", coursesRoute);
app.use("/api/students", studentsRoute);
app.use("/api/match", matchingRoute);
app.use("/api/scholarships", scholarshipsRoute);
app.use("/api/teachers", teachersRoute);
app.use("/api/admin", adminRoute);
app.use("/api/inquiries", inquiriesRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/student-notifications", studentNotificationsRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({ success: false, message: "Internal server error", error: err.message });
});

// Vercel imports this app with all routes registered, including announcements.
export default app;

async function startDBWithRetry(retries = 5, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await initDB();
      return;
    } catch (err) {
      console.warn(`[Neon DB] Connection attempt ${i}/${retries} failed:`, err.message);
      if (i < retries) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("Failed to connect to Neon Database after all retries.");
      }
    }
  }
}

// Only start a standalone server and seed the database for local execution.
// Serverless imports must not open a listener or run background seed jobs.
const isMainModule = process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is up and running on port http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
  startDBWithRetry();
}

