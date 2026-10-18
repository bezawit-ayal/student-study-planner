
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, default: "", maxlength: 1000 },
        dueDate: { type: Date, default: null },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        completed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const examSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 120 },
        date: { type: Date, default: null },
        time: { type: String, default: "", maxlength: 20 },
        notes: { type: String, default: "", maxlength: 1000 },
    },
    { timestamps: true }
);

const studySessionSchema = new mongoose.Schema(
    {
        title: { type: String, default: "Study session", trim: true, maxlength: 120 },
        date: { type: Date, default: null },
        duration: { type: Number, default: 0, min: 0, max: 1440 },
        notes: { type: String, default: "", maxlength: 1000 },
    },
    { timestamps: true }
);

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            default: "#174D36",
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },
        assignments: {
            type: [assignmentSchema],
            default: [],
        },
        exams: {
            type: [examSchema],
            default: [],
        },
        studySessions: {
            type: [studySessionSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
