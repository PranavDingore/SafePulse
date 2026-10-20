
const express = require("express");

const {
    createDevice,
    getMyDevices,
    deviceHeartbeat,
    updateSensorData
} = require("../controllers/deviceController");

const protect = require("../middleware/authMiddleware");
const protectDevice = require("../middleware/deviceAuthMiddleware");

const router = express.Router();

router.post("/heartbeat", protect, deviceHeartbeat);
router.post("/sensor-data", protectDevice, updateSensorData);

// Register a new device
router.post("/", protect, createDevice);

// Get logged-in user's devices
router.get("/", protect, getMyDevices);

module.exports = router;
