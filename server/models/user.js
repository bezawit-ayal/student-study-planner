
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        passwordHash: {
            type: String,
            select: false,
        },
        profilePhoto: {
            type: String,
            default: "",
            maxlength: 2048,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
