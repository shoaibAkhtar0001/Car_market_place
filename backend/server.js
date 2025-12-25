const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const carRoutes = require("./routes/cars");
const wishlistRoutes = require("./routes/wishlist");
const bookingRoutes = require("./routes/bookings");
const offersRoutes = require("./routes/offers");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// expose io to routes
app.locals.io = io;

// Middleware
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection failed ❌", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/offers", offersRoutes);

// Socket.IO
io.on("connection", (socket) => {
  socket.on("join", (room) => socket.join(room));
  socket.on("leave", (room) => socket.leave(room));
});

// ================================
// SERVE FRONTEND (VITE BUILD)
// ================================
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// Catch-all route → React app
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
