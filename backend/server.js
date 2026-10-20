const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const deviceRoutes = require("./routes/deviceRoutes");
const alertRoutes = require("./routes/alertRoutes");
const deviceAuthRoutes = require("./routes/deviceAuthRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/devices", deviceRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/device-auth", deviceAuthRoutes);

connectDB();
app.use("/api/auth", authRoutes);

app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You have access to the protected route",
        user: req.user
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "SafePulse Backend is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});