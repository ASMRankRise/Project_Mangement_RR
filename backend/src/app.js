const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal Server Error"
        : err.message || "Something went wrong",
  });
});

module.exports = app;
