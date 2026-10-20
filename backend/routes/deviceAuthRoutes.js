
const express = require("express");

const {
    authenticateDevice
} = require("../controllers/deviceAuthController");

const router = express.Router();

router.post("/token", authenticateDevice);

module.exports = router;