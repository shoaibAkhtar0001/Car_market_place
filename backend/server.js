const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
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
    origin: '*',
    methods: ['GET','POST','PATCH','DELETE']
  }
});

// expose io to routes
app.locals.io = io;

// Middleware - Increase JSON limit for image uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected ✅"))
.catch((err) => console.error("MongoDB connection failed ❌", err));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/offers", offersRoutes);

io.on('connection', (socket) => {
  // Clients can join rooms for car or user updates
  socket.on('join', (room) => socket.join(room));
  socket.on('leave', (room) => socket.leave(room));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
