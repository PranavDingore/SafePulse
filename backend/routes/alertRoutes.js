
const express = require("express");

const {
    createAlert,
    getMyAlerts,
    createSOSAlert,
    updateAlertStatus,
    deleteAlert,
    createDeviceAccidentAlert,
    createDeviceSOSAlert,
    createDeviceSmokeAlert
} = require("../controllers/alertController");

const protect = require("../middleware/authMiddleware");
const protectDevice = require("../middleware/deviceAuthMiddleware");

const router = express.Router();

router.post("/device-smoke", protectDevice, createDeviceSmokeAlert);
router.delete("/:id", protect, deleteAlert);
router.post("/", protect, createAlert);
router.get("/", protect, getMyAlerts);
router.post("/sos", protect, createSOSAlert);
router.patch("/:id/status", protect, updateAlertStatus);
router.post("/device-accident", protectDevice, createDeviceAccidentAlert);
router.post("/device-sos", protectDevice, createDeviceSOSAlert);

module.exports = router;
