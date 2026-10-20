const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true
        },

        vehicleNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        },
        smokeDetected: {
    type: Boolean,
    default: false
},

        impactLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "high"
        },

        status: {
            type: String,
            enum: ["new", "notified", "resolved"],
            default: "new"
        },
        alertType: {
    type: String,
    enum: ["accident", "sos", "smoke"],
    default: "accident"
},   
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Alert", alertSchema);