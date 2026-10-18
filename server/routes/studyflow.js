
const express = require("express");
const mongoose = require("mongoose");

const Subject = require("../models/subject");
const User = require("../models/user");
const FocusSession = require("../models/focussession");
const Notification = require("../models/notification");

const router = express.Router();

function asyncRoute(handler) {
    return (req, res, next) =>
        Promise.resolve(handler(req, res, next)).catch(next);
}

function validId(id) {
    return mongoose.isValidObjectId(id);
}

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pickFields(body, fields) {
    if (!isRecord(body)) return {};
    return Object.fromEntries(
        fields
            .filter((field) => Object.hasOwn(body, field))
            .map((field) => [field, body[field]])
    );
}

function hasOnlyFields(body, fields) {
    return isRecord(body) && Object.keys(body).every((key) => fields.includes(key));
}

function validString(value, maxLength) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

// SUBJECTS
router.get("/subjects", asyncRoute(async (req, res) => {
    const subjects = await Subject.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: subjects });
}));

router.post("/subjects", asyncRoute(async (req, res) => {
    const { name, color, description = "" } = req.body || {};

    if (!validString(name, 100) || typeof description !== "string" || description.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Enter a subject name (up to 100 characters) and a description under 500 characters.",
        });
    }

    if (color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(color)) {
        return res.status(400).json({ success: false, message: "Choose a valid subject color." });
    }

    const subject = await Subject.create({
        name: name.trim(),
        color,
        description: description.trim(),
    });
    res.status(201).json({ success: true, data: subject });
}));

router.patch("/subjects/:id", asyncRoute(async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid subject ID." });
    }

    const updates = pickFields(req.body, ["name", "color", "description"]);
    if (!hasOnlyFields(req.body, ["name", "color", "description"]) || Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "Provide valid subject fields to update." });
    }
    if (Object.hasOwn(updates, "name") && !validString(updates.name, 100)) {
        return res.status(400).json({ success: false, message: "Subject name must be between 1 and 100 characters." });
    }
    if (Object.hasOwn(updates, "description") && (typeof updates.description !== "string" || updates.description.length > 500)) {
        return res.status(400).json({ success: false, message: "Subject description must be under 500 characters." });
    }
    if (Object.hasOwn(updates, "color") && !/^#[0-9a-fA-F]{6}$/.test(updates.color)) {
        return res.status(400).json({ success: false, message: "Choose a valid subject color." });
    }

    const subject = await Subject.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!subject) {
        return res.status(404).json({ success: false, message: "Subject not found." });
    }

    res.json({ success: true, data: subject });
}));

router.delete("/subjects/:id", asyncRoute(async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid subject ID." });
    }

    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
        return res.status(404).json({ success: false, message: "Subject not found." });
    }

    res.json({ success: true, message: "Subject deleted." });
}));

// ASSIGNMENTS, EXAMS, AND STUDY SESSIONS
const childResources = {
    assignments: "assignments",
    exams: "exams",
    "study-sessions": "studySessions",
};

for (const [routeName, fieldName] of Object.entries(childResources)) {
    const allowedFields = {
        assignments: ["title", "description", "dueDate", "priority", "completed"],
        exams: ["title", "date", "time", "notes"],
        "study-sessions": ["title", "date", "duration", "notes"],
    }[routeName];

    router.post(
        `/subjects/:id/${routeName}`,
        asyncRoute(async (req, res) => {
            if (!validId(req.params.id)) {
                return res.status(400).json({ success: false, message: "Invalid subject ID." });
            }

            const payload = pickFields(req.body, allowedFields);
            if (!hasOnlyFields(req.body, allowedFields)) {
                return res.status(400).json({ success: false, message: "The request contains unsupported fields." });
            }
            if (routeName !== "study-sessions" && !validString(payload.title, 120)) {
                return res.status(400).json({ success: false, message: "A title of up to 120 characters is required." });
            }
            if (routeName === "study-sessions" && Object.hasOwn(payload, "duration") &&
                (!Number.isInteger(payload.duration) || payload.duration < 1 || payload.duration > 1440)) {
                return res.status(400).json({ success: false, message: "Study session duration must be between 1 and 1,440 minutes." });
            }

            const subject = await Subject.findById(req.params.id);
            if (!subject) {
                return res.status(404).json({ success: false, message: "Subject not found." });
            }

            subject[fieldName].push(payload);
            await subject.save();

            res.status(201).json({
                success: true,
                data: subject[fieldName][subject[fieldName].length - 1],
            });
        })
    );

    router.patch(
        `/subjects/:id/${routeName}/:itemid`,
        asyncRoute(async (req, res) => {
            const { id, itemid } = req.params;

            if (!validId(id) || !validId(itemid)) {
                return res.status(400).json({ success: false, message: "Invalid ID." });
            }

            if (!hasOnlyFields(req.body, allowedFields) || Object.keys(req.body).length === 0) {
                return res.status(400).json({ success: false, message: "Provide valid fields to update." });
            }
            const updates = pickFields(req.body, allowedFields);
            if (Object.hasOwn(updates, "title") && !validString(updates.title, 120)) {
                return res.status(400).json({ success: false, message: "Title must be between 1 and 120 characters." });
            }
            if (routeName === "study-sessions" && Object.hasOwn(updates, "duration") &&
                (!Number.isInteger(updates.duration) || updates.duration < 1 || updates.duration > 1440)) {
                return res.status(400).json({ success: false, message: "Study session duration must be between 1 and 1,440 minutes." });
            }

            const subject = await Subject.findById(id);
            if (!subject) {
                return res.status(404).json({ success: false, message: "Subject not found." });
            }

            const item = subject[fieldName].id(itemid);
            if (!item) {
                return res.status(404).json({ success: false, message: "Item not found." });
            }

            item.set(updates);
            await subject.save();

            res.json({ success: true, data: item });
        })
    );

    router.delete(
        `/subjects/:id/${routeName}/:itemid`,
        asyncRoute(async (req, res) => {
            const { id, itemid } = req.params;

            if (!validId(id) || !validId(itemid)) {
                return res.status(400).json({ success: false, message: "Invalid ID." });
            }

            const subject = await Subject.findById(id);
            if (!subject) {
                return res.status(404).json({ success: false, message: "Subject not found." });
            }

            const item = subject[fieldName].id(itemid);
            if (!item) {
                return res.status(404).json({ success: false, message: "Item not found." });
            }

            item.deleteOne();
            await subject.save();

            res.json({ success: true, message: "Item deleted." });
        })
    );
}

// FOCUS SESSION HISTORY
router.get("/focus-sessions", asyncRoute(async (req, res) => {
    const sessions = await FocusSession.find().sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
}));

router.post("/focus-sessions", asyncRoute(async (req, res) => {
    const payload = pickFields(req.body, ["subjectId", "duration", "completed", "startedAt", "endedAt"]);
    if (!hasOnlyFields(req.body, ["subjectId", "duration", "completed", "startedAt", "endedAt"]) ||
        !Number.isInteger(payload.duration) || payload.duration < 1 || payload.duration > 180 ||
        payload.completed !== true) {
        return res.status(400).json({
            success: false,
            message: "A completed focus session between 1 and 180 minutes is required.",
        });
    }
    if (payload.subjectId !== null && payload.subjectId !== undefined && !validId(payload.subjectId)) {
        return res.status(400).json({ success: false, message: "Invalid subject ID." });
    }
    if (payload.startedAt && Number.isNaN(new Date(payload.startedAt).getTime())) {
        return res.status(400).json({ success: false, message: "Invalid focus session start time." });
    }
    if (payload.endedAt && Number.isNaN(new Date(payload.endedAt).getTime())) {
        return res.status(400).json({ success: false, message: "Invalid focus session end time." });
    }
    if (payload.startedAt && payload.endedAt &&
        new Date(payload.endedAt) < new Date(payload.startedAt)) {
        return res.status(400).json({ success: false, message: "Focus session end time must follow its start time." });
    }
    if (payload.subjectId) {
        const subjectExists = await Subject.exists({ _id: payload.subjectId });
        if (!subjectExists) {
            return res.status(404).json({ success: false, message: "Subject not found." });
        }
    }
    const session = await FocusSession.create(payload);
    res.status(201).json({ success: true, data: session });
}));

// NOTIFICATIONS
router.get("/notifications", asyncRoute(async (req, res) => {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
}));

router.post("/notifications", asyncRoute(async (req, res) => {
    const payload = pickFields(req.body, ["title", "message", "type", "read", "relatedId"]);
    if (!hasOnlyFields(req.body, ["title", "message", "type", "read", "relatedId"]) ||
        !validString(payload.title, 120) ||
        !validString(payload.message, 1000)) {
        return res.status(400).json({ success: false, message: "A title and message are required." });
    }
    const notification = await Notification.create(payload);
    res.status(201).json({ success: true, data: notification });
}));

router.patch("/notifications/:id", asyncRoute(async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid notification ID." });
    }

    const updates = pickFields(req.body, ["title", "message", "type", "read"]);
    if (!hasOnlyFields(req.body, ["title", "message", "type", "read"]) || Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "Provide valid notification fields to update." });
    }
    if (Object.hasOwn(updates, "title") && !validString(updates.title, 120)) {
        return res.status(400).json({ success: false, message: "Notification title must be between 1 and 120 characters." });
    }
    if (Object.hasOwn(updates, "message") && !validString(updates.message, 1000)) {
        return res.status(400).json({ success: false, message: "Notification message must be between 1 and 1,000 characters." });
    }

    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found." });
    }

    res.json({ success: true, data: notification });
}));

router.delete("/notifications/:id", asyncRoute(async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid notification ID." });
    }

    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found." });
    }

    res.json({ success: true, message: "Notification deleted." });
}));

// BASIC USER PROFILE ENDPOINTS (not authentication)
router.get("/users/:id", asyncRoute(async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, data: user });
}));

router.post("/users", asyncRoute(async (req, res) => {
    const { name, email, profilePhoto = "" } = req.body || {};

    if (!validString(name, 100) ||
        typeof email !== "string" ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof profilePhoto !== "string" ||
        profilePhoto.length > 2048) {
        return res.status(400).json({
            success: false,
            message: "Provide a valid name, email address, and optional profile photo URL.",
        });
    }

    const user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        profilePhoto: profilePhoto.trim(),
    });
    res.status(201).json({ success: true, data: user });
}));

router.patch("/users/:id", asyncRoute(async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const updates = pickFields(req.body, ["name", "email", "profilePhoto"]);
    if (!hasOnlyFields(req.body, ["name", "email", "profilePhoto"]) || Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "Provide valid profile fields to update." });
    }
    if (Object.hasOwn(updates, "name") && !validString(updates.name, 100)) {
        return res.status(400).json({ success: false, message: "Name must be between 1 and 100 characters." });
    }
    if (Object.hasOwn(updates, "email") &&
        (typeof updates.email !== "string" || updates.email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email))) {
        return res.status(400).json({ success: false, message: "Provide a valid email address." });
    }
    if (Object.hasOwn(updates, "profilePhoto") &&
        (typeof updates.profilePhoto !== "string" || updates.profilePhoto.length > 2048)) {
        return res.status(400).json({ success: false, message: "Profile photo URL must be under 2,048 characters." });
    }
    if (typeof updates.name === "string") updates.name = updates.name.trim();
    if (typeof updates.email === "string") updates.email = updates.email.trim().toLowerCase();
    if (typeof updates.profilePhoto === "string") updates.profilePhoto = updates.profilePhoto.trim();

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, data: user });
}));

module.exports = router;
