const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "StudyFlow backend is running!",
        database:
            mongoose.connection.readyState === 1
                ? "connected"
                : "disconnected",
    });
});

app.use("/api", require("./routes/studyflow"));
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found.",
    });
});

app.use((err, req, res, next) => {
    console.error(`${req.method} ${req.originalUrl}:`, err);
    if (res.headersSent) {
        return next(err);
    }

    const status = err.code === 11000
        ? 409
        : ["ValidationError", "CastError"].includes(err.name) || err.status === 400
            ? 400
            : Number.isInteger(err.status) && err.status >= 400 && err.status < 500
                ? err.status
                : 500;

    res.status(status).json({
        success: false,
        message: status === 500
            ? "An unexpected server error occurred."
            : err.code === 11000
                ? "A record with these details already exists."
                : err.message,
    });
});


async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`StudyFlow server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
