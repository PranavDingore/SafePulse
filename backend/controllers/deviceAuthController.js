
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Device = require("../models/Device");

const authenticateDevice = async (req, res) => {
    try {
        const { deviceId, deviceSecret } = req.body;

        if (!deviceId || !deviceSecret) {
            return res.status(400).json({
                message: "Device ID and secret are required"
            });
        }

        const device = await Device.findOne({
            deviceId,
            status: "active"
        }).select("+deviceSecretHash");

        if (!device || !device.deviceSecretHash) {
            return res.status(401).json({
                message: "Invalid device credentials"
            });
        }

        const suppliedHash = crypto
            .createHash("sha256")
            .update(deviceSecret)
            .digest();

        const storedHash = Buffer.from(
            device.deviceSecretHash,
            "hex"
        );

        if (
            suppliedHash.length !== storedHash.length ||
            !crypto.timingSafeEqual(suppliedHash, storedHash)
        ) {
            return res.status(401).json({
                message: "Invalid device credentials"
            });
        }

        const token = jwt.sign(
            {
                deviceId: device.deviceId,
                deviceDbId: device._id.toString(),
                ownerId: device.owner.toString(),
                type: "device"
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return res.json({
            message: "Device authenticated successfully",
            token,
            expiresIn: 900
        });
    } catch (error) {
        console.error("Device authentication failed:", error.message);

        return res.status(500).json({
            message: "Device authentication failed"
        });
    }
};

module.exports = { authenticateDevice };