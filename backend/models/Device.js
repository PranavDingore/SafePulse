const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
    {
        deviceId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        vehicleNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        deviceSecretHash: {
    type: String,
    select: false,
    default: undefined
},

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        lastSeen: {
    type: Date,
    default: null
},

        lastLocation: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        },
    lastSensorData: {
    temperature: Number,
    humidity: Number,
    smoke: Number,
    acceleration: Number,
    rotation: Number,
    latitude: Number,
    longitude: Number,
    updatedAt: Date
},  
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Device", deviceSchema);
