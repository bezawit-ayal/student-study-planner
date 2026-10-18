const assert = require("node:assert/strict");
const test = require("node:test");

const Subject = require("../models/subject");
const FocusSession = require("../models/focussession");
const Notification = require("../models/notification");
const User = require("../models/user");

test("subjects and nested activities validate without a database connection", async (t) => {
    await t.test("accepts a subject with planned exams and study sessions", async () => {
        const subject = new Subject({
            name: "Biology",
            exams: [{ title: "Cell biology", date: "2026-11-10" }],
            studySessions: [{ title: "Review notes", duration: 45 }],
        });

        await assert.doesNotReject(subject.validate());
        assert.equal(subject.color, "#174D36");
    });

    await t.test("rejects invalid assignment priorities", async () => {
        const subject = new Subject({
            name: "History",
            assignments: [{ title: "Essay", priority: "urgent" }],
        });

        await assert.rejects(subject.validate(), { name: "ValidationError" });
    });

    await t.test("rejects study plans longer than one day", async () => {
        const subject = new Subject({
            name: "Chemistry",
            studySessions: [{ title: "Study", duration: 1441 }],
        });

        await assert.rejects(subject.validate(), { name: "ValidationError" });
    });
});

test("focus sessions are constrained to supported timer durations", async () => {
    const session = new FocusSession({
        duration: 180,
        completed: true,
        startedAt: "2026-10-18T12:00:00.000Z",
        endedAt: "2026-10-18T15:00:00.000Z",
    });
    await assert.doesNotReject(session.validate());

    const tooLong = new FocusSession({ duration: 181 });
    await assert.rejects(tooLong.validate(), { name: "ValidationError" });
});

test("notifications reject unsupported types", async () => {
    const notification = new Notification({
        title: "Review notes",
        message: "Read the chapter before class.",
        type: "social",
    });

    await assert.rejects(notification.validate(), { name: "ValidationError" });
});

test("basic profile records require a valid email", async () => {
    const user = new User({ name: "Student", email: "not-an-email" });
    await assert.rejects(user.validate(), { name: "ValidationError" });
});
