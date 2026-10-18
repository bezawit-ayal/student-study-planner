
const mongoose = require("mongoose");

const focusSessionSchema = new mongoose.Schema(
    {
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            default: null,
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
            max: 180,
        },
        completed: {
            type: Boolean,
            default: true,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        endedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FocusSession", focusSessionSchema);
