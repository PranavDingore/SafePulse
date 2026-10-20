const Device = require("../models/Device");

// Add/Register a new device
const createDevice = async (req, res) => {
    try {
        const { deviceId, vehicleNumber } = req.body;

        // Check if device already exists
        const existingDevice = await Device.findOne({ deviceId });

        if (existingDevice) {
            return res.status(400).json({
                message: "Device already registered"
            });
        }

        // Create device
        const device = await Device.create({
            deviceId,
            vehicleNumber,
            owner: req.user.id
        });

        res.status(201).json({
            message: "Device registered successfully",
            device
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to register device",
            error: error.message
        });
    }
};


// Get devices of logged-in user
const getMyDevices = async (req, res) => {
    try {
        const devices = await Device.find({
            owner: req.user.id
        });

        res.json({
            count: devices.length,
            devices
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch devices",
            error: error.message
        });
    }
};

const deviceHeartbeat = async (req, res) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({
                message: "Device ID is required"
            });
        }

        const device = await Device.findOne({
            deviceId,
            owner: req.user.id
        });

        if (!device) {
            return res.status(404).json({
                message: "Device not found"
            });
        }

        device.lastSeen = new Date();
        await device.save();

        return res.json({
            message: "Heartbeat received",
            deviceId: device.deviceId,
            lastSeen: device.lastSeen
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update heartbeat"
        });
    }
};
const updateSensorData = async (req, res) => {
    try {
        const {
            deviceId,
            temperature,
            humidity,
            smoke,
            acceleration,
            rotation,
            latitude,
            longitude
        } = req.body;

        if (!deviceId) {
            return res.status(400).json({
                message: "Device ID is required"
            });
        }

        const device = req.device;

        if (!device || device.deviceId !== deviceId) {
            return res.status(404).json({
                message: "Device not found"
            });
        }

        device.lastSensorData = {
            temperature,
            humidity,
            smoke,
            acceleration,
            rotation,
            latitude,
            longitude,
            updatedAt: new Date()
        };

        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {
            device.lastLocation = { latitude, longitude };
        }

        device.lastSeen = new Date();
        await device.save();

        return res.json({
            message: "Sensor data updated",
            sensorData: device.lastSensorData
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update sensor data",
            error: error.message
        });
    }
};

module.exports = {
    createDevice,
    getMyDevices,
    deviceHeartbeat,
    updateSensorData
};