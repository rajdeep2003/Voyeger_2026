require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");


const connectDB = require("./config/database");
const { connectClodinary } = require("./config/cloudinary");
const authroutes = require("./routes/authroute");
const placeroutes = require("./routes/placeroute");
const ownerHotelRoutes = require("./routes/ownerhotelroutes");
const hotelRouter = require("./routes/hotelroute");
const orderRouter = require("./routes/orderRoute");
const bookingrouter = require("./routes/bookingroute");
const souvenirrouter = require("./routes/souvenirroute");
const locationRoutes = require("./routes/location");
const monumentRoutes = require("./routes/monumentroutes");
const frameRoutes = require("./routes/frameroute");
const emergencyrouter = require("./routes/emergencyroutes");
const aiRouter = require("./routes/airoute");
const { startCleanupScheduler } = require("./utils/cleanup");

// Connect to Database & Cloudinary
connectDB();
connectClodinary();

// Start cleanup scheduler for old location records
startCleanupScheduler();

const app = express();

// ─── Request / Response Logger ───────────────────────────────────────────────
app.use(morgan("dev")); // concise colored logs in dev

app.use((req, res, next) => {
  const start = Date.now();

  console.log(`📥 ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `📤 ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

// 🔓 CORS Setup - Allow All Origins (Use this for development or Vercel deployment)
app.use(
  cors({
    origin: true, // Reflects the request origin
    credentials: true, // Allows cookies to be sent
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.send("Voyager API Server is Running");
});
app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "Voyager API is alive 🚀" });
});

app.use("/api/users", authroutes);
app.use("/api/places", placeroutes);
app.use("/api/orders", orderRouter);
app.use("/api/bookings", bookingrouter);
app.use("/api/souvenirs", souvenirrouter);
app.use("/api/location", locationRoutes);
app.use("/api/owner/hotel", ownerHotelRoutes);
app.use("/api/monuments", monumentRoutes);
app.use("/api/frames", frameRoutes);
app.use("/api/emergency", emergencyrouter);
app.use("/api/ai", aiRouter);


// Convert coordinates to address using OpenStreetMap Nominatim reverse geocoding API
app.get("/api/loc-get-details/reverse-geocode", async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: "lat & lon required",
      });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Voyager2026/1.0 (rajdeep3002@gmail.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API failed: ${response.status}`);
    }

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON from Nominatim:", text);
      throw new Error("Invalid geocoding response");
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});
// app.use("/api/hotels", hotelRouter); // Uncomment if needed



//move this api to routes and controllers later
app.get("/api/tourist-spots", async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "lat & lon required",
      });
    }

    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"]["wikidata"](around:15000,${lat},${lon});
        way["tourism"]["wikidata"](around:15000,${lat},${lon});
        relation["tourism"]["wikidata"](around:15000,${lat},${lon});
      );
      out center;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "Voyager2026/1.0",
        },
        body: overpassQuery,
      }
    );

    if (!response.ok) {
      throw new Error("Overpass API failed");
    }

    const data = await response.json();

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Track Page ──────────────────────────────────────────────────────────────
app.get("/track/:userId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be defined with 4 args so Express recognises it as an error handler
app.use((err, req, res, next) => {
  console.error("💥 GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Crash Safety ─────────────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥", err);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
