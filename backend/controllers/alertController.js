const Alert = require("../models/Alert");
const Device = require("../models/Device");
const { sendTelegramAlert } = require("../services/telegramService");

// Create accident alert
const createAlert = async (req, res) => {
    try {
        const {
            deviceId,
            vehicleNumber,
            latitude,
            longitude,
            impactLevel
        } = req.body;

        // Check if device exists
        const device = await Device.findOne({
            deviceId: deviceId,
            owner: req.user.id
        });

        if (!device) {
            return res.status(404).json({
                message: "Device not found or not owned by this user"
            });
        }

        // Create accident alert
        const alert = await Alert.create({
            deviceId: device._id,
            vehicleNumber,
            latitude,
            longitude,
            impactLevel: impactLevel || "high"
        });

        // Update device's last GPS location
        if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
) {
    device.lastLocation = {
        latitude,
        longitude
    };
}

await device.save();

        try {
    const location =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : "GPS location unavailable";

    await sendTelegramAlert(
        `🚨 SAFEPULSE ACCIDENT ALERT\n\n` +
        `Vehicle: ${vehicleNumber}\n` +
        `Impact: ${(impactLevel || "high").toUpperCase()}\n` +
        `Location: ${location}`
    );

    console.log("Manual accident Telegram alert sent");
} catch (error) {
    console.error("Telegram notification failed:", error.message);
}

        res.status(201).json({
            message: "Accident alert created successfully",
            alert
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create accident alert",
            error: error.message
        });
    }
};


// Get accident alerts of logged-in user
const getMyAlerts = async (req, res) => {
    try {
        const devices = await Device.find({
            owner: req.user.id
        }).select("_id");

        const deviceIds = devices.map(device => device._id);

        const alerts = await Alert.find({
            deviceId: { $in: deviceIds }
        }).sort({ createdAt: -1 });

        res.json({
            count: alerts.length,
            alerts
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch alerts",
            error: error.message
        });
    }
};
// Create SOS alert
const createSOSAlert = async (req, res) => {
    try {
        const {
            deviceId,
            vehicleNumber,
            latitude,
            longitude
        } = req.body;

        const device = await Device.findOne({
            deviceId,
            owner: req.user.id
        });

        if (!device) {
            return res.status(404).json({
                message: "Device not found or not owned by this user"
            });
        }

        const alert = await Alert.create({
            deviceId: device._id,
            vehicleNumber,
            latitude,
            longitude,
            alertType: "sos",
            impactLevel: "high"
        });

        device.lastLocation = { latitude, longitude };
        await device.save();
        try {
    const location =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : "GPS location unavailable";

    await sendTelegramAlert(
        `🆘 SAFEPULSE SOS ALERT\n\n` +
        `Vehicle: ${vehicleNumber}\n` +
        `Emergency SOS button pressed.\n` +
        `Location: ${location}`
    );

    console.log("Manual SOS Telegram alert sent");
} catch (error) {
    console.error("Telegram notification failed:", error.message);
}        

        return res.status(201).json({
            message: "SOS alert created successfully",
            alert
        });
        } catch (error) {
    console.error("Device SOS Error:", error.message);
    console.error(error.stack);

    return res.status(500).json({
        message: "Failed to create device SOS alert",
        error: error.message
    });
}
};

const createDeviceAccidentAlert = async (req, res) => {
    try {
        const {
    vehicleNumber,
    latitude,
    longitude,
    impactLevel,
    smokeDetected
} = req.body;

        const device = req.device;

        const alert = await Alert.create({
            deviceId: device._id,
            vehicleNumber: vehicleNumber || device.vehicleNumber,
            latitude,
            longitude,
            impactLevel: impactLevel || "high",
            alertType: "accident"
        });

        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {
            device.lastLocation = { latitude, longitude };
        }

        device.lastSeen = new Date();
        await device.save();
        try {
    const location =
        Number.isFinite(latitude) && Number.isFinite(longitude)
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : "GPS location unavailable";

    await sendTelegramAlert(
        `🚨 SAFEPULSE ACCIDENT ALERT\n\n` +
        `Vehicle: ${vehicleNumber || device.vehicleNumber}\n` +
        `Impact: ${(impactLevel || "high").toUpperCase()}\n` +
        `Smoke/Gas Detected: ${smokeDetected === true ? "YES" : "NO"}\n` +
        `Location: ${location}`
    );

    console.log("Telegram accident alert sent");
} catch (telegramError) {
    console.error("Telegram notification failed:", telegramError.message);
}

        return res.status(201).json({
            message: "Device accident alert created successfully",
            alert
        });
    } catch (error) {
    console.error("Device SOS Error:", error);

    return res.status(500).json({
        message: "Failed to create device SOS alert",
        error: error.message
    });
}
};

const createDeviceSOSAlert = async (req, res) => {
    try {
       const {
    vehicleNumber,
    latitude,
    longitude,
    smokeDetected
} = req.body;

        const device = req.device;

        const alert = await Alert.create({
            deviceId: device._id,
            vehicleNumber: vehicleNumber || device.vehicleNumber,
            latitude,
            longitude,
            alertType: "sos",
            impactLevel: "high",
            smokeDetected: smokeDetected === true,
        });

        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {
            device.lastLocation = { latitude, longitude };
        }

        device.lastSeen = new Date();
        await device.save();
        try {
    const location =
        Number.isFinite(latitude) && Number.isFinite(longitude)
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : "GPS location unavailable";

    await sendTelegramAlert(
        `🆘 SAFEPULSE SOS ALERT\n\n` +
        `Vehicle: ${vehicleNumber || device.vehicleNumber}\n` +
        `Emergency SOS button pressed.\n` +
        `Smoke/Gas Detected: ${smokeDetected === true ? "YES" : "NO"}\n` +
        `Location: ${location}`
    );

    console.log("Telegram SOS alert sent");
} catch (telegramError) {
    console.error("Telegram notification failed:", telegramError.message);
}

        return res.status(201).json({
            message: "Device SOS alert created successfully",
            alert
        });
        } catch (error) {
        console.error("Device SOS Error:", error);

        return res.status(500).json({
            message: "Failed to create device SOS alert",
            error: error.message
        });
    }
};

const updateAlertStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["new", "resolved"].includes(status)) {
            return res.status(400).json({
                message: "Invalid alert status"
            });
        }

        const devices = await Device.find({
            owner: req.user.id
        }).select("_id");

        const deviceIds = devices.map(device => device._id);

        const alert = await Alert.findOneAndUpdate(
            {
                _id: req.params.id,
                deviceId: { $in: deviceIds }
            },
            { status },
            { new: true, runValidators: true }
        );

        if (!alert) {
            return res.status(404).json({
                message: "Alert not found"
            });
        }

        res.json({
            message: "Alert status updated successfully",
            alert
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update alert status"
        });
    }
};

const deleteAlert = async (req, res) => {
    try {
        const devices = await Device.find({
            owner: req.user.id
        }).select("_id");

        const deviceIds = devices.map(device => device._id);

        const alert = await Alert.findOneAndDelete({
            _id: req.params.id,
            deviceId: { $in: deviceIds }
        });

        if (!alert) {
            return res.status(404).json({
                message: "Alert not found"
            });
        }

        return res.json({
            message: "Alert deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete alert"
        });
    }
};
const createDeviceSmokeAlert = async (req, res) => {
    try {
        const { smoke, latitude, longitude } = req.body;
        const device = req.device;

        if (!Number.isFinite(smoke)) {
            return res.status(400).json({
                message: "Valid smoke reading is required"
            });
        }

        const alert = await Alert.create({
            deviceId: device._id,
            vehicleNumber: device.vehicleNumber,
            latitude: Number.isFinite(latitude)
                ? latitude
                : device.lastLocation.latitude,
            longitude: Number.isFinite(longitude)
                ? longitude
                : device.lastLocation.longitude,
            alertType: "smoke",
            impactLevel: "high"
        });

        try {
            await sendTelegramAlert(
                `⚠️ SAFEPULSE SMOKE/GAS ALERT\n\n` +
                `Vehicle: ${device.vehicleNumber}\n` +
                `MQ-2 Reading: ${smoke} ADC\n` +
                `Possible smoke/gas detected.\n` +
                `Please check the vehicle.`
            );
        } catch (error) {
            console.error("Smoke Telegram notification failed:", error.message);
        }

        return res.status(201).json({
            message: "Smoke alert created successfully",
            alert
        });
    } catch (error) {
        console.error("Device Smoke Error:", error);
        return res.status(500).json({
            message: "Failed to create smoke alert",
            error: error.message
        });
    }
};

module.exports = {
    createAlert,
    getMyAlerts,
    createSOSAlert,
    updateAlertStatus,
    deleteAlert,
    createDeviceAccidentAlert,
    createDeviceSOSAlert,
    createDeviceSmokeAlert,
};