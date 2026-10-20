
const jwt = require("jsonwebtoken");
const Device = require("../models/Device");

const protectDevice = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Device token required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.type !== "device" || !decoded.deviceDbId) {
            return res.status(401).json({
                message: "Invalid device token"
            });
        }

        const device = await Device.findById(decoded.deviceDbId);

        if (
            !device ||
            device.status !== "active" ||
            device.deviceId !== decoded.deviceId
        ) {
            return res.status(401).json({
                message: "Device not found or inactive"
            });
        }

        req.device = device;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Device token invalid or expired"
        });
    }
};

module.exports = protectDevice;

