
require("dotenv").config();

const crypto = require("crypto");
const mongoose = require("mongoose");
const Device = require("../models/Device");

async function main() {
    const deviceId = "ESP32-001";

    await mongoose.connect(process.env.MONGODB_URI);

    const device = await Device.findOne({ deviceId })
        .select("+deviceSecretHash");

    if (!device) {
        throw new Error(`Device ${deviceId} not found`);
    }

    if (device.deviceSecretHash) {
        throw new Error(
            "Device already provisioned. Refusing to replace its secret."
        );
    }

    const secret = crypto.randomBytes(32).toString("hex");

    device.deviceSecretHash = crypto
        .createHash("sha256")
        .update(secret)
        .digest("hex");

    await device.save();

    console.log("\nDevice provisioned successfully.");
    console.log("Device ID:", deviceId);
    console.log("DEVICE SECRET (save it privately now):");
    console.log(secret);
    console.log("\nThis secret will not be displayed again.");

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error("Provisioning failed:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
});
