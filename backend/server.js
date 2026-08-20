const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Global Request Logger for Debugging (Moved to top)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ limit: "1gb", extended: true }));

const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const jwt = require("jsonwebtoken");
const Member = require("./models/Member");
const User = require("./models/User");

// PDF protection middleware for static uploads
app.get("/uploads/*path", async (req, res, next) => {
  try {
    let decodedPath = req.path;
    try {
      decodedPath = decodeURIComponent(req.path);
    } catch (e) {}

    if (!decodedPath.toLowerCase().endsWith(".pdf")) return next();

    const reqPath = decodedPath.replace(/^\/uploads[/\\]+/, "");
    const fullFilePath = path.join(__dirname, "uploads", reqPath);

    if (!fs.existsSync(fullFilePath)) {
      return next();
    }

    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    let isLoggedIn = false;
    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "isor_secret_key_2026";
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          // Check if valid User or Member account exists (active or inactive)
          const userObj = await User.findById(decoded.id);
          if (userObj) {
            isLoggedIn = true;
          } else {
            const memberObj = await Member.findById(decoded.id);
            if (memberObj) {
              isLoggedIn = true;
            }
          }
        }
      } catch (e) {
        isLoggedIn = false;
      }
    }

    if (!isLoggedIn) {
      return res.status(401).json({ 
        message: "Authentication required to access full journal PDF files.",
        redirectTo: "/user/login"
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(fullFilePath);
  } catch (err) {
    next();
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // 30 second timeout for Atlas cluster connections
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 DNS resolution for Node 18/22 compatibility
  })
  .then(() => console.log("Successfully connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost. Attempting auto-reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully.");
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/userAuth"));
app.use("/api/topbar", require("./routes/topbar"));
app.use("/api/header", require("./routes/header"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/news", require("./routes/news"));
app.use("/api/banner", require("./routes/banner"));
app.use("/api/quicklinks", require("./routes/quickLinks"));
app.use("/api/home-content", require("./routes/homeContent"));
app.use("/api/membership", require("./routes/membership"));
app.use("/api/admin/members", require("./routes/adminMember"));
app.use("/api/admin/payment-settings", require("./routes/paymentSettings"));
app.use("/api/committees", require("./routes/committee"));
app.use("/api/journal", require("./routes/journal"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/events", require("./routes/event"));
app.use("/api/national-events", require("./routes/nationalEvent"));
app.use("/api/admin/event-registrations", require("./routes/eventRegistration"));
app.use("/api/brainstorm", require("./routes/brainstorm"));
app.use("/api/awards", require("./routes/award"));
app.use("/api/manuscript", require("./routes/manuscript"));
app.use("/api/admin/users", require("./routes/adminUser"));
app.use("/api/footer", require("./routes/footer"));

app.use("/api/pages", require("./routes/page"));
app.use("/api/pdf", require("./routes/pdf"));

app.get("/api/ping", (req, res) => res.json({ status: "ok", message: "Backend is reachable v2" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large. Maximum limit is 1GB." });
  }
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
