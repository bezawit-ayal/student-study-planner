
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        type: {
            type: String,
            enum: ["assignment", "exam", "study", "focus", "general"],
            default: "general",
        },
        read: {
            type: Boolean,
            default: false,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
