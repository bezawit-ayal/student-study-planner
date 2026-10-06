import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    Check,
    Clock3,
    Plus,
    Trash2
} from "lucide-react"

import { useEffect, useState } from "react"

function Dashboard() {
    const [subjects, setSubjects] = useState([])

    const [selectedSubjectId, setSelectedSubjectId] = useState(null)

    const [activeView, setActiveView] = useState("plan")

    const [showSubjectForm, setShowSubjectForm] = useState(false)
    const [subjectName, setSubjectName] = useState("")

    const [activeWorkspaceTab, setActiveWorkspaceTab] =
        useState("assignments")

    const [showAssignmentForm, setShowAssignmentForm] = useState(false)
    const [assignmentTitle, setAssignmentTitle] = useState("")
    const [assignmentDate, setAssignmentDate] = useState("")

    const [showExamForm, setShowExamForm] = useState(false)
    const [examTitle, setExamTitle] = useState("")
    const [examDate, setExamDate] = useState("")
    const [examTime, setExamTime] = useState("")

    const [showSessionForm, setShowSessionForm] = useState(false)
    const [sessionDay, setSessionDay] = useState("")
    const [sessionTime, setSessionTime] = useState("")
    const [sessionDuration, setSessionDuration] = useState("60")
    const [sessionFocus, setSessionFocus] = useState("")
    const [focusSubjectId, setFocusSubjectId] = useState("")
    const [focusTask, setFocusTask] = useState("")
    const [focusDuration, setFocusDuration] = useState("25")
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [timerRunning, setTimerRunning] = useState(false)
    const [focusHistory, setFocusHistory] = useState([])

    function formatTimer(seconds) {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`
    }
    function getProgressStats() {
        const totalAssignments = subjects.reduce(
            (total, subject) =>
                total + subject.assignments.length,
            0
        )

        const completedAssignments = subjects.reduce(
            (total, subject) =>
                total +
                subject.assignments.filter(
                    (assignment) => assignment.completed
                ).length,
            0
        )

        const totalExams = subjects.reduce(
            (total, subject) =>
                total + subject.exams.length,
            0
        )

        const totalStudyMinutes = subjects.reduce(
            (total, subject) =>
                total +
                subject.studySessions.reduce(
                    (sessionTotal, session) =>
                        sessionTotal + Number(session.duration || 0),
                    0
                ),
            0
        )

        const completedFocusMinutes = focusHistory.reduce(
            (total, session) =>
                total + Number(session.duration || 0),
            0
        )

        const totalFocusSessions = focusHistory.length

        const assignmentProgress =
            totalAssignments > 0
                ? Math.round(
                    (completedAssignments /
                        totalAssignments) *
                    100
                )
                : 0

        const subjectProgress = subjects.map((subject) => {
            const total = subject.assignments.length
            const completed = subject.assignments.filter(
                (assignment) => assignment.completed
            ).length

            return {
                ...subject,
                totalAssignments: total,
                completedAssignments: completed,
                progress:
                    total > 0
                        ? Math.round(
                            (completed / total) * 100
                        )
                        : 0
            }
        })

        return {
            totalAssignments,
            completedAssignments,
            totalExams,
            totalStudyMinutes,
            completedFocusMinutes,
            totalFocusSessions,
            assignmentProgress,
            subjectProgress
        }
    }

    function getFocusDuration(value) {
        const minutes = Number(value)

        if (!Number.isFinite(minutes)) {
            return 25
        }

        return Math.min(
            Math.max(Math.floor(minutes), 1),
            180
        )
    }

    function changeFocusDuration(value) {
        if (value === "") {
            setFocusDuration("")
            setTimeLeft(0)
            setTimerRunning(false)
            return
        }

        const duration = getFocusDuration(value)

        setFocusDuration(String(duration))
        setTimeLeft(duration * 60)

        if (timerRunning) {
            setTimerRunning(false)
        }
    }

    function stepFocusDuration(amount) {
        const current = Number(focusDuration) || 25
        const next = Math.min(Math.max(current + amount, 1), 180)
        changeFocusDuration(String(next))
    }

    function startFocusTimer() {
        if (!focusSubjectId || !focusTask.trim()) {
            return
        }

        const duration = getFocusDuration(focusDuration)

        if (timeLeft <= 0 || !focusDuration) {
            setFocusDuration(String(duration))
            setTimeLeft(duration * 60)
        }

        setTimerRunning(true)
    }

    function resetFocusTimer() {
        setTimerRunning(false)

        const duration = getFocusDuration(focusDuration)

        setTimeLeft(duration * 60)
    }

    function completeFocusSession() {
        const subject = subjects.find(
            (item) => item.id === Number(focusSubjectId)
        )

        if (!subject) {
            return
        }

        setFocusHistory((current) => [
            ...current,
            {
                id: Date.now(),
                subject: subject.name,
                focus: focusTask.trim(),
                duration: getFocusDuration(focusDuration),
                completedAt: new Date().toISOString()
            }
        ])

        setTimerRunning(false)
        setTimeLeft(0)
    }


    useEffect(() => {
        if (!timerRunning) {
            return
        }

        const interval = setInterval(() => {
            setTimeLeft((current) => {
                if (current <= 1) {
                    return 0
                }

                return current - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timerRunning])

    useEffect(() => {
        if (timerRunning && timeLeft === 0) {
            completeFocusSession()
        }
    }, [timeLeft, timerRunning])

    function addSubject(event) {
        event.preventDefault()

        if (!subjectName.trim()) {
            return
        }

        const newSubject = {
            id: Date.now(),
            name: subjectName.trim(),
            assignments: [],
            exams: [],
            studySessions: []
        }

        setSubjects((current) => [
            ...current,
            newSubject
        ])

        setSubjectName("")
        setShowSubjectForm(false)
        setSelectedSubjectId(newSubject.id)
        setActiveWorkspaceTab("assignments")
    }

    function addAssignment(event) {
        event.preventDefault()

        if (!assignmentTitle.trim() || !assignmentDate) {
            return
        }

        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    assignments: [
                        ...subject.assignments,
                        {
                            id: Date.now(),
                            title: assignmentTitle.trim(),
                            dueDate: assignmentDate,
                            completed: false
                        }
                    ]
                }
            })
        )

        setAssignmentTitle("")
        setAssignmentDate("")
        setShowAssignmentForm(false)
    }

    function toggleAssignment(assignmentId) {
        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    assignments: subject.assignments.map(
                        (assignment) =>
                            assignment.id === assignmentId
                                ? {
                                    ...assignment,
                                    completed: !assignment.completed
                                }
                                : assignment
                    )
                }
            })
        )
    }

    function deleteAssignment(assignmentId) {
        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    assignments: subject.assignments.filter(
                        (assignment) =>
                            assignment.id !== assignmentId
                    )
                }
            })
        )
    }

    function addExam(event) {
        event.preventDefault()

        if (!examTitle.trim() || !examDate) {
            return
        }

        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    exams: [
                        ...subject.exams,
                        {
                            id: Date.now(),
                            title: examTitle.trim(),
                            date: examDate,
                            time: examTime
                        }
                    ]
                }
            })
        )

        setExamTitle("")
        setExamDate("")
        setExamTime("")
        setShowExamForm(false)
    }

    function deleteExam(examId) {
        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    exams: subject.exams.filter(
                        (exam) =>
                            exam.id !== examId
                    )
                }
            })
        )
    }

    function addStudySession(event) {
        event.preventDefault()

        if (
            !sessionDay ||
            !sessionTime ||
            !sessionDuration ||
            !sessionFocus.trim()
        ) {
            return
        }

        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    studySessions: [
                        ...subject.studySessions,
                        {
                            id: Date.now(),
                            day: sessionDay,
                            time: sessionTime,
                            duration: Number(sessionDuration),
                            focus: sessionFocus.trim(),
                            completed: false
                        }
                    ]
                }
            })
        )

        setSessionDay("")
        setSessionTime("")
        setSessionDuration("60")
        setSessionFocus("")
        setShowSessionForm(false)
    }

    function toggleStudySession(sessionId) {
        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    studySessions: subject.studySessions.map(
                        (session) =>
                            session.id === sessionId
                                ? { ...session, completed: !session.completed }
                                : session
                    )
                }
            })
        )
    }

    function deleteStudySession(sessionId) {
        setSubjects((current) =>
            current.map((subject) => {
                if (subject.id !== selectedSubjectId) {
                    return subject
                }

                return {
                    ...subject,
                    studySessions: subject.studySessions.filter(
                        (session) =>
                            session.id !== sessionId
                    )
                }
            })
        )
    }

    function openSubject(subjectId) {
        setSelectedSubjectId(subjectId)
        setActiveWorkspaceTab("assignments")
        setShowAssignmentForm(false)
        setShowExamForm(false)
        setShowSessionForm(false)
    }

    function closeSubject() {
        setSelectedSubjectId(null)
        setShowAssignmentForm(false)
        setShowExamForm(false)
        setShowSessionForm(false)
    }

    const selectedSubject = subjects.find(
        (subject) =>
            subject.id === selectedSubjectId
    )

    function formatDay(day) {
        if (!day) {
            return ""
        }

        return day.charAt(0).toUpperCase() + day.slice(1)
    }

    /*
     * CALENDAR
     */

    function getWeekDays() {
        const today = new Date()
        const currentDay = today.getDay()

        const mondayOffset =
            currentDay === 0
                ? -6
                : 1 - currentDay

        const monday = new Date(today)

        monday.setDate(
            today.getDate() + mondayOffset
        )

        return Array.from(
            { length: 7 },
            (_, index) => {
                const date = new Date(monday)

                date.setDate(
                    monday.getDate() + index
                )

                return {
                    date,
                    key: date.toISOString().split("T")[0],
                    dayName: date.toLocaleDateString(
                        undefined,
                        {
                            weekday: "short"
                        }
                    ),
                    fullDayName: date.toLocaleDateString(
                        undefined,
                        {
                            weekday: "long"
                        }
                    ),
                    dayNumber: date.getDate()
                }
            }
        )
    }

    function getCalendarEvents() {
        const events = []

        subjects.forEach((subject) => {
            subject.assignments.forEach((assignment) => {
                events.push({
                    id: `assignment-${assignment.id}`,
                    type: "assignment",
                    title: assignment.title,
                    subject: subject.name,
                    date: assignment.dueDate,
                    time: null,
                    completed: assignment.completed
                })
            })

            subject.exams.forEach((exam) => {
                events.push({
                    id: `exam-${exam.id}`,
                    type: "exam",
                    title: exam.title,
                    subject: subject.name,
                    date: exam.date,
                    time: exam.time || null
                })
            })
        })

        return events
    }

    function getCalendarSessions(dayName) {
        const sessions = []

        subjects.forEach((subject) => {
            subject.studySessions.forEach((session) => {
                if (
                    session.day.toLowerCase() ===
                    dayName.toLowerCase()
                ) {
                    sessions.push({
                        id: `session-${session.id}`,
                        type: "session",
                        title: session.focus,
                        subject: subject.name,
                        time: session.time,
                        duration: session.duration
                    })
                }
            })
        })

        return sessions
    }

    const weekDays = getWeekDays()
    const calendarEvents = getCalendarEvents()
    const progressStats = getProgressStats()

    return (
        <main className="dashboard-page">

            {/* =========================
                NAVIGATION
            ========================= */}

            <nav className="dashboard-nav">

                <div className="brand">

                    <span className="brand-mark">
                        <BookOpen
                            size={18}
                            strokeWidth={1.8}
                        />
                    </span>

                    <span>
                        StudyFlow
                    </span>

                </div>

                <div className="dashboard-nav-right">

                    <button
                        type="button"
                        className={`dashboard-nav-link ${activeView === "calendar"
                            ? "active"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveView("calendar")
                            setSelectedSubjectId(null)
                        }}
                    >
                        Calendar
                    </button>
                    <button
                        type="button"
                        className={`dashboard-nav-link ${activeView === "focus" ? "active" : ""
                            }`}
                        onClick={() => {
                            setActiveView("focus")
                            setSelectedSubjectId(null)
                        }}
                    >
                        Focus timer
                    </button>

                    <button
                        type="button"
                        className={`dashboard-nav-link ${activeView === "progress" ? "active" : ""
                            }`}
                        onClick={() => {
                            setActiveView("progress")
                            setSelectedSubjectId(null)
                        }}
                    >
                        Progress
                    </button>

                    <button
                        type="button"
                        className={`dashboard-nav-link ${activeView === "plan"
                            ? "active"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveView("plan")
                        }}
                    >
                        Study plan
                    </button>

                    <button
                        className="profile-button"
                        type="button"
                    >
                        B
                    </button>

                </div>

            </nav>


            {/* =========================
                CALENDAR VIEW
            ========================= */}

            {activeView === "calendar" ? (

                <section className="calendar-page">

                    <div className="calendar-header">

                        <div>

                            <p className="plan-label">
                                YOUR SCHEDULE
                            </p>

                            <h1>
                                This week.
                            </h1>

                            <p>
                                See your assignments, exams,
                                and study sessions together
                                in one place.
                            </p>

                        </div>

                    </div>


                    <div className="calendar-week">

                        {weekDays.map((day) => {

                            const dayEvents =
                                calendarEvents.filter(
                                    (event) =>
                                        event.date === day.key
                                )

                            const daySessions =
                                getCalendarSessions(
                                    day.fullDayName
                                )

                            const hasEvents =
                                dayEvents.length > 0 ||
                                daySessions.length > 0

                            return (
                                <div
                                    className="calendar-day"
                                    key={day.key}
                                >

                                    <div className="calendar-day-header">

                                        <span>
                                            {day.dayName}
                                        </span>

                                        <strong>
                                            {day.dayNumber}
                                        </strong>

                                    </div>


                                    <div className="calendar-events">

                                        {dayEvents.map(
                                            (event) => (
                                                <div
                                                    className={`calendar-event ${event.type} ${event.completed
                                                        ? "completed"
                                                        : ""
                                                        }`}
                                                    key={event.id}
                                                >

                                                    <span className="calendar-event-type">
                                                        {event.type === "exam"
                                                            ? "EXAM"
                                                            : "ASSIGNMENT"}
                                                    </span>

                                                    <strong>
                                                        {event.title}
                                                    </strong>

                                                    <span>
                                                        {event.subject}
                                                    </span>

                                                    {event.time && (
                                                        <small>
                                                            {event.time}
                                                        </small>
                                                    )}

                                                    {event.completed && (
                                                        <small>
                                                            Completed
                                                        </small>
                                                    )}

                                                </div>
                                            )
                                        )}


                                        {daySessions.map(
                                            (session) => (
                                                <div
                                                    className="calendar-event session"
                                                    key={session.id}
                                                >

                                                    <span className="calendar-event-type">
                                                        STUDY
                                                    </span>

                                                    <strong>
                                                        {session.title}
                                                    </strong>

                                                    <span>
                                                        {session.subject}
                                                    </span>

                                                    <small>
                                                        {session.time}
                                                        {" · "}
                                                        {session.duration}
                                                        {" min"}
                                                    </small>

                                                </div>
                                            )
                                        )}


                                        {!hasEvents && (
                                            <div className="calendar-no-events">
                                                Nothing planned
                                            </div>
                                        )}

                                    </div>

                                </div>
                            )
                        })}

                    </div>

                </section>

            ) : activeView === "focus" ? (
                <section className="focus-page">

                    <div className="focus-header">

                        <p className="plan-label">
                            FOCUS SESSION
                        </p>

                        <h1>
                            Time to
                            <br />
                            <em>focus.</em>
                        </h1>

                        <p>
                            Choose what you want to work on and set
                            the amount of time that feels right for you.
                        </p>

                    </div>

                    <div className="focus-layout">

                        <div className="focus-settings">

                            <div className="focus-field">

                                <label htmlFor="focus-subject">
                                    Subject
                                </label>

                                <select
                                    id="focus-subject"
                                    value={focusSubjectId}
                                    onChange={(event) => {
                                        setFocusSubjectId(event.target.value)
                                        setFocusTask("")
                                    }}
                                    disabled={timerRunning}
                                >
                                    <option value="">
                                        Choose a subject
                                    </option>

                                    {subjects.map((subject) => (
                                        <option
                                            key={subject.id}
                                            value={subject.id}
                                        >
                                            {subject.name}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            <div className="focus-field">

                                <label htmlFor="focus-task">
                                    What are you working on?
                                </label>

                                <input
                                    id="focus-task"
                                    type="text"
                                    value={focusTask}
                                    onChange={(event) =>
                                        setFocusTask(event.target.value)
                                    }
                                    placeholder="e.g. React components"
                                    disabled={timerRunning}
                                />

                            </div>

                            <div className="focus-field">

                                <label>
                                    Duration
                                </label>

                                <div className="duration-options">

                                    <button
                                        type="button"
                                        className={
                                            focusDuration === "25"
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            changeFocusDuration("25")
                                        }
                                        disabled={timerRunning}
                                    >
                                        25 min
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            focusDuration === "45"
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            changeFocusDuration("45")
                                        }
                                        disabled={timerRunning}
                                    >
                                        45 min
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            focusDuration === "60"
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            changeFocusDuration("60")
                                        }
                                        disabled={timerRunning}
                                    >
                                        60 min
                                    </button>

                                </div>

                            </div>

                            <div className="focus-field">

                                <label htmlFor="custom-duration">
                                    Custom duration
                                </label>

                                <div className="custom-duration">

                                    <button
                                        type="button"
                                        className="duration-step"
                                        onClick={() => stepFocusDuration(-1)}
                                        disabled={timerRunning}
                                        aria-label="Decrease duration"
                                    >
                                        −
                                    </button>

                                    <input
                                        id="custom-duration"
                                        type="number"
                                        min="1"
                                        max="180"
                                        value={focusDuration}
                                        onChange={(event) =>
                                            changeFocusDuration(
                                                event.target.value
                                            )
                                        }
                                        disabled={timerRunning}
                                    />

                                    <button
                                        type="button"
                                        className="duration-step"
                                        onClick={() => stepFocusDuration(1)}
                                        disabled={timerRunning}
                                        aria-label="Increase duration"
                                    >
                                        +
                                    </button>

                                    <span>minutes</span>

                                </div>

                                <small>
                                    Choose any duration from 1 to 180 minutes.
                                </small>

                            </div>

                        </div>

                        <div className="focus-timer">

                            <div className="timer-label">
                                {timerRunning
                                    ? "STUDYING"
                                    : timeLeft === 0
                                        ? "SESSION COMPLETE"
                                        : "READY"}
                            </div>

                            <div className="timer-display">
                                {formatTimer(timeLeft)}
                            </div>

                            <div className="timer-task">

                                {focusTask.trim()
                                    ? focusTask
                                    : "Choose something to work on"}

                            </div>

                            <div className="timer-subject">

                                {focusSubjectId
                                    ? subjects.find(
                                        (subject) =>
                                            subject.id === Number(
                                                focusSubjectId
                                            )
                                    )?.name
                                    : "No subject selected"}

                            </div>

                            <div className="timer-actions">

                                {!timerRunning && timeLeft !== 0 && (
                                    <button
                                        type="button"
                                        className="timer-primary"
                                        onClick={startFocusTimer}
                                        disabled={
                                            !focusSubjectId ||
                                            !focusTask.trim()
                                        }
                                    >
                                        Start studying
                                    </button>
                                )}

                                {timerRunning && (
                                    <button
                                        type="button"
                                        className="timer-primary"
                                        onClick={() =>
                                            setTimerRunning(false)
                                        }
                                    >
                                        Pause
                                    </button>
                                )}

                                {!timerRunning && timeLeft === 0 && (
                                    <button
                                        type="button"
                                        className="timer-primary"
                                        onClick={resetFocusTimer}
                                    >
                                        Start again
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="timer-reset"
                                    onClick={resetFocusTimer}
                                >
                                    Reset
                                </button>

                            </div>

                        </div>

                    </div>

                    {focusHistory.length > 0 && (
                        <div className="focus-history">

                            <div className="focus-history-header">

                                <div>
                                    <p className="plan-label">
                                        COMPLETED
                                    </p>

                                    <h2>
                                        Recent focus sessions
                                    </h2>
                                </div>

                            </div>

                            <div className="focus-history-list">

                                {focusHistory
                                    .slice()
                                    .reverse()
                                    .slice(0, 5)
                                    .map((session) => (
                                        <div
                                            className="focus-history-row"
                                            key={session.id}
                                        >

                                            <div>
                                                <strong>
                                                    {session.focus}
                                                </strong>

                                                <span>
                                                    {session.subject}
                                                </span>
                                            </div>

                                            <strong>
                                                {session.duration} min
                                            </strong>

                                        </div>
                                    ))}

                            </div>

                        </div>
                    )}

                </section>
            ) : activeView === "progress" ? (
                <section className="progress-page">

                    <div className="progress-header">
                        <p className="plan-label">
                            YOUR PROGRESS
                        </p>

                        <h1>
                            See how you're
                            <br />
                            <em>moving forward.</em>
                        </h1>

                        <p>
                            Your progress is based on the work
                            you've added and completed in StudyFlow.
                        </p>
                    </div>

                    <div className="progress-stats">

                        <div className="progress-stat">
                            <span>ASSIGNMENTS</span>

                            <strong>
                                {progressStats.completedAssignments}
                                <small>
                                    / {progressStats.totalAssignments}
                                </small>
                            </strong>

                            <p>completed</p>
                        </div>

                        <div className="progress-stat">
                            <span>COMPLETION</span>

                            <strong>
                                {progressStats.assignmentProgress}%
                            </strong>

                            <p>assignment progress</p>
                        </div>

                        <div className="progress-stat">
                            <span>PLANNED STUDY</span>

                            <strong>
                                {progressStats.totalStudyMinutes}
                                <small> min</small>
                            </strong>

                            <p>scheduled study time</p>
                        </div>

                        <div className="progress-stat">
                            <span>FOCUS SESSIONS</span>

                            <strong>
                                {progressStats.totalFocusSessions}
                            </strong>

                            <p>
                                {progressStats.completedFocusMinutes} min
                                completed
                            </p>
                        </div>

                    </div>

                    <div className="progress-section">

                        <div className="progress-section-header">
                            <div>
                                <p className="plan-label">
                                    BY SUBJECT
                                </p>

                                <h2>
                                    Your subjects.
                                </h2>
                            </div>
                        </div>

                        {progressStats.subjectProgress.length === 0 ? (

                            <div className="progress-empty">
                                <h3>
                                    Your progress starts here.
                                </h3>

                                <p>
                                    Add a subject and some assignments
                                    to start seeing your progress.
                                </p>
                            </div>

                        ) : (

                            <div className="subject-progress-list">

                                {progressStats.subjectProgress.map(
                                    (subject) => (
                                        <div
                                            className="subject-progress-row"
                                            key={subject.id}
                                        >

                                            <div className="subject-progress-info">

                                                <strong>
                                                    {subject.name}
                                                </strong>

                                                <span>
                                                    {
                                                        subject.completedAssignments
                                                    }{" "}
                                                    of{" "}
                                                    {
                                                        subject.totalAssignments
                                                    } assignments completed
                                                </span>

                                            </div>

                                            <div className="subject-progress-bar">

                                                <div
                                                    className="subject-progress-fill"
                                                    style={{
                                                        width: `${subject.progress}%`
                                                    }}
                                                />

                                            </div>

                                            <strong className="subject-progress-percent">
                                                {subject.progress}%
                                            </strong>

                                        </div>
                                    )
                                )}

                            </div>

                        )}

                    </div>

                    <div className="progress-bottom">

                        <div className="progress-card">

                            <p className="plan-label">
                                EXAMS
                            </p>

                            <strong>
                                {progressStats.totalExams}
                            </strong>

                            <span>
                                {progressStats.totalExams === 1
                                    ? "exam in your plan"
                                    : "exams in your plan"}
                            </span>

                        </div>

                        <div className="progress-card">

                            <p className="plan-label">
                                FOCUS TIME
                            </p>

                            <strong>
                                {progressStats.completedFocusMinutes}
                                <small> min</small>
                            </strong>

                            <span>
                                completed through the focus timer
                            </span>

                        </div>

                    </div>

                </section>

            ) : (

                /* =========================
                    STUDY PLAN VIEW
                ========================= */

                !selectedSubject ? (

                    <section className="plan-page">

                        <div className="plan-intro">

                            <div className="plan-icon">

                                <BookOpen
                                    size={21}
                                    strokeWidth={1.7}
                                />

                            </div>

                            <p className="plan-label">
                                MY STUDY PLAN
                            </p>

                            <h1>
                                Your subjects,
                                <br />
                                your <em>plan.</em>
                            </h1>

                            <p className="plan-description">
                                Add the subjects you're studying.
                                Each subject gets its own workspace
                                for assignments, exams, and study sessions.
                            </p>

                        </div>


                        <div className="plan-section">

                            <div className="plan-section-header">

                                <div>

                                    <span className="plan-number">
                                        01
                                    </span>

                                    <div>

                                        <h2>
                                            Your subjects
                                        </h2>

                                        <p>
                                            Choose a subject to open its workspace.
                                        </p>

                                    </div>

                                </div>


                                <button
                                    className="plan-add-button"
                                    type="button"
                                    onClick={() =>
                                        setShowSubjectForm(true)
                                    }
                                >
                                    <Plus size={16} />
                                    Add subject
                                </button>

                            </div>


                            {showSubjectForm && (

                                <form
                                    className="subject-form"
                                    onSubmit={addSubject}
                                >

                                    <input
                                        type="text"
                                        placeholder="e.g. Web Development"
                                        value={subjectName}
                                        onChange={(event) =>
                                            setSubjectName(
                                                event.target.value
                                            )
                                        }
                                        autoFocus
                                    />

                                    <button type="submit">
                                        Add
                                    </button>

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => {
                                            setShowSubjectForm(false)
                                            setSubjectName("")
                                        }}
                                    >
                                        Cancel
                                    </button>

                                </form>

                            )}


                            {subjects.length === 0 ? (

                                <div className="empty-plan">

                                    <BookOpen
                                        size={24}
                                        strokeWidth={1.4}
                                    />

                                    <h3>
                                        Your plan is empty.
                                    </h3>

                                    <p>
                                        Add the subjects you are currently studying.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowSubjectForm(true)
                                        }
                                    >
                                        Add your first subject
                                        <Plus size={15} />
                                    </button>

                                </div>

                            ) : (

                                <div className="subject-list">

                                    {subjects.map(
                                        (subject, index) => (

                                            <button
                                                className="subject-row"
                                                key={subject.id}
                                                type="button"
                                                onClick={() =>
                                                    openSubject(
                                                        subject.id
                                                    )
                                                }
                                            >

                                                <span className="subject-index">
                                                    {String(
                                                        index + 1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </span>

                                                <div className="subject-details">

                                                    <strong>
                                                        {subject.name}
                                                    </strong>

                                                    <span>
                                                        {subject.assignments.length}{" "}
                                                        {subject.assignments.length === 1
                                                            ? "assignment"
                                                            : "assignments"}
                                                        {" · "}
                                                        {subject.exams.length}{" "}
                                                        {subject.exams.length === 1
                                                            ? "exam"
                                                            : "exams"}
                                                        {" · "}
                                                        {subject.studySessions.length}{" "}
                                                        sessions
                                                    </span>

                                                </div>

                                                <span className="subject-open">
                                                    Open
                                                </span>

                                            </button>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </section>

                ) : (
                    < section className="subject-workspace">

                        <button
                            className="workspace-back"
                            type="button"
                            onClick={closeSubject}
                        >
                            <ArrowLeft size={16} />
                            Back to subjects
                        </button>


                        <div className="workspace-header">

                            <p className="plan-label">
                                SUBJECT WORKSPACE
                            </p>

                            <h1>
                                {selectedSubject.name}
                            </h1>

                            <p>
                                Everything you need to manage
                                this subject in one place.
                            </p>

                        </div>


                        <div className="workspace-navigation">

                            <button
                                className={`workspace-tab ${activeWorkspaceTab === "assignments"
                                    ? "active"
                                    : ""
                                    }`}
                                type="button"
                                onClick={() => {
                                    setActiveWorkspaceTab(
                                        "assignments"
                                    )

                                    setShowAssignmentForm(false)
                                    setShowExamForm(false)
                                    setShowSessionForm(false)
                                }}
                            >
                                Assignments
                            </button>


                            <button
                                className={`workspace-tab ${activeWorkspaceTab === "exams"
                                    ? "active"
                                    : ""
                                    }`}
                                type="button"
                                onClick={() => {
                                    setActiveWorkspaceTab("exams")

                                    setShowAssignmentForm(false)
                                    setShowExamForm(false)
                                    setShowSessionForm(false)
                                }}
                            >
                                Exams
                            </button>


                            <button
                                className={`workspace-tab ${activeWorkspaceTab === "sessions"
                                    ? "active"
                                    : ""
                                    }`}
                                type="button"
                                onClick={() => {
                                    setActiveWorkspaceTab("sessions")

                                    setShowAssignmentForm(false)
                                    setShowExamForm(false)
                                    setShowSessionForm(false)
                                }}
                            >
                                Study sessions
                            </button>

                        </div>


                        {/* =========================
                            ASSIGNMENTS
                        ========================= */}

                        {activeWorkspaceTab === "assignments" && (

                            <section className="workspace-section">

                                <div className="workspace-section-header">

                                    <div>

                                        <span className="plan-number">
                                            01
                                        </span>

                                        <h2>
                                            Assignments
                                        </h2>

                                        <p>
                                            Work that belongs to{" "}
                                            {selectedSubject.name}.
                                        </p>

                                    </div>


                                    <button
                                        className="plan-add-button"
                                        type="button"
                                        onClick={() =>
                                            setShowAssignmentForm(true)
                                        }
                                    >
                                        <Plus size={16} />
                                        Add assignment
                                    </button>

                                </div>


                                {showAssignmentForm && (

                                    <form
                                        className="assignment-form"
                                        onSubmit={addAssignment}
                                    >

                                        <div className="assignment-input">

                                            <label htmlFor="assignment-title">
                                                Assignment
                                            </label>

                                            <input
                                                id="assignment-title"
                                                type="text"
                                                placeholder="e.g. Finish chapter 4 exercises"
                                                value={assignmentTitle}
                                                onChange={(event) =>
                                                    setAssignmentTitle(
                                                        event.target.value
                                                    )
                                                }
                                                autoFocus
                                            />

                                        </div>


                                        <div className="assignment-input">

                                            <label htmlFor="assignment-date">
                                                Due date
                                            </label>

                                            <input
                                                id="assignment-date"
                                                type="date"
                                                value={assignmentDate}
                                                onChange={(event) =>
                                                    setAssignmentDate(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="assignment-actions">

                                            <button type="submit">
                                                Add assignment
                                            </button>

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={() => {
                                                    setShowAssignmentForm(false)
                                                    setAssignmentTitle("")
                                                    setAssignmentDate("")
                                                }}
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </form>

                                )}


                                {selectedSubject.assignments.length === 0 ? (

                                    <div className="workspace-empty">

                                        <CalendarDays
                                            size={23}
                                            strokeWidth={1.5}
                                        />

                                        <div>

                                            <h3>
                                                No assignments yet.
                                            </h3>

                                            <p>
                                                Add assignments that belong to{" "}
                                                {selectedSubject.name}.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="assignment-list">

                                        {selectedSubject.assignments.map(
                                            (assignment) => (

                                                <div
                                                    className={`assignment-row ${assignment.completed
                                                        ? "completed"
                                                        : ""
                                                        }`}
                                                    key={assignment.id}
                                                >

                                                    <button
                                                        className="assignment-check"
                                                        type="button"
                                                        onClick={() =>
                                                            toggleAssignment(
                                                                assignment.id
                                                            )
                                                        }
                                                    >
                                                        {assignment.completed && (
                                                            <Check size={14} />
                                                        )}
                                                    </button>


                                                    <div className="assignment-details">

                                                        <strong>
                                                            {assignment.title}
                                                        </strong>

                                                        <span>
                                                            Due{" "}
                                                            {new Date(
                                                                `${assignment.dueDate}T00:00:00`
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric"
                                                                }
                                                            )}
                                                        </span>

                                                    </div>


                                                    <button
                                                        className="delete-assignment"
                                                        type="button"
                                                        onClick={() =>
                                                            deleteAssignment(
                                                                assignment.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </section>

                        )}


                        {/* =========================
                            EXAMS
                        ========================= */}

                        {activeWorkspaceTab === "exams" && (

                            <section className="workspace-section">

                                <div className="workspace-section-header">

                                    <div>

                                        <span className="plan-number">
                                            02
                                        </span>

                                        <h2>
                                            Exams & deadlines
                                        </h2>

                                        <p>
                                            Important dates for{" "}
                                            {selectedSubject.name}.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className="plan-add-button"
                                        onClick={() =>
                                            setShowExamForm(
                                                !showExamForm
                                            )
                                        }
                                    >
                                        {showExamForm
                                            ? "Cancel"
                                            : "Add exam"}
                                    </button>

                                </div>


                                {showExamForm && (

                                    <form
                                        className="exam-form"
                                        onSubmit={addExam}
                                    >

                                        <div className="assignment-input">

                                            <label htmlFor="exam-title">
                                                Exam
                                            </label>

                                            <input
                                                id="exam-title"
                                                type="text"
                                                placeholder="e.g. Database Systems final"
                                                value={examTitle}
                                                onChange={(event) =>
                                                    setExamTitle(
                                                        event.target.value
                                                    )
                                                }
                                                autoFocus
                                            />

                                        </div>


                                        <div className="assignment-input">

                                            <label htmlFor="exam-date">
                                                Date
                                            </label>

                                            <input
                                                id="exam-date"
                                                type="date"
                                                value={examDate}
                                                onChange={(event) =>
                                                    setExamDate(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="assignment-input">

                                            <label htmlFor="exam-time">
                                                Time
                                            </label>

                                            <input
                                                id="exam-time"
                                                type="time"
                                                value={examTime}
                                                onChange={(event) =>
                                                    setExamTime(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="assignment-actions">

                                            <button type="submit">
                                                Add exam
                                            </button>

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={() => {
                                                    setShowExamForm(false)
                                                    setExamTitle("")
                                                    setExamDate("")
                                                    setExamTime("")
                                                }}
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </form>

                                )}


                                {selectedSubject.exams.length === 0 ? (

                                    <div className="workspace-empty">

                                        <CalendarDays
                                            size={23}
                                            strokeWidth={1.5}
                                        />

                                        <div>

                                            <h3>
                                                No exams added yet.
                                            </h3>

                                            <p>
                                                Add an exam or important deadline
                                                for this subject.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="exam-list">

                                        {selectedSubject.exams.map(
                                            (exam) => (

                                                <div
                                                    className="exam-row"
                                                    key={exam.id}
                                                >

                                                    <div className="exam-date-box">

                                                        <span>
                                                            {new Date(
                                                                `${exam.date}T00:00:00`
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    month: "short"
                                                                }
                                                            )}
                                                        </span>

                                                        <strong>
                                                            {new Date(
                                                                `${exam.date}T00:00:00`
                                                            ).getDate()}
                                                        </strong>

                                                    </div>


                                                    <div className="exam-details">

                                                        <strong>
                                                            {exam.title}
                                                        </strong>

                                                        <span>

                                                            {new Date(
                                                                `${exam.date}T00:00:00`
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    weekday: "long",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                    year: "numeric"
                                                                }
                                                            )}

                                                            {exam.time && (
                                                                <>
                                                                    {" · "}
                                                                    {exam.time}
                                                                </>
                                                            )}

                                                        </span>

                                                    </div>


                                                    <button
                                                        className="delete-assignment"
                                                        type="button"
                                                        onClick={() =>
                                                            deleteExam(
                                                                exam.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </section>

                        )}


                        {/* =========================
                            STUDY SESSIONS
                        ========================= */}

                        {activeWorkspaceTab === "sessions" && (

                            <section className="workspace-section">

                                <div className="workspace-section-header">

                                    <div>

                                        <span className="plan-number">
                                            03
                                        </span>

                                        <h2>
                                            Study sessions
                                        </h2>

                                        <p>
                                            Choose when you want to study{" "}
                                            {selectedSubject.name}.
                                        </p>

                                    </div>


                                    <button
                                        className="plan-add-button"
                                        type="button"
                                        onClick={() =>
                                            setShowSessionForm(true)
                                        }
                                    >
                                        <Plus size={16} />
                                        Add session
                                    </button>

                                </div>


                                {showSessionForm && (

                                    <form
                                        className="session-form"
                                        onSubmit={addStudySession}
                                    >

                                        <div className="assignment-input">

                                            <label htmlFor="session-day">
                                                Day
                                            </label>

                                            <select
                                                id="session-day"
                                                value={sessionDay}
                                                onChange={(event) =>
                                                    setSessionDay(
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Choose a day
                                                </option>

                                                <option value="monday">
                                                    Monday
                                                </option>

                                                <option value="tuesday">
                                                    Tuesday
                                                </option>

                                                <option value="wednesday">
                                                    Wednesday
                                                </option>

                                                <option value="thursday">
                                                    Thursday
                                                </option>

                                                <option value="friday">
                                                    Friday
                                                </option>

                                                <option value="saturday">
                                                    Saturday
                                                </option>

                                                <option value="sunday">
                                                    Sunday
                                                </option>

                                            </select>

                                        </div>


                                        <div className="assignment-input">

                                            <label htmlFor="session-time">
                                                Start time
                                            </label>

                                            <input
                                                id="session-time"
                                                type="time"
                                                value={sessionTime}
                                                onChange={(event) =>
                                                    setSessionTime(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="assignment-input">

                                            <label htmlFor="session-duration">
                                                Duration
                                            </label>

                                            <select
                                                id="session-duration"
                                                value={sessionDuration}
                                                onChange={(event) =>
                                                    setSessionDuration(
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                <option value="30">
                                                    30 minutes
                                                </option>

                                                <option value="45">
                                                    45 minutes
                                                </option>

                                                <option value="60">
                                                    1 hour
                                                </option>

                                                <option value="90">
                                                    1 hour 30 minutes
                                                </option>

                                                <option value="120">
                                                    2 hours
                                                </option>

                                                <option value="150">
                                                    2 hours 30 minutes
                                                </option>

                                                <option value="180">
                                                    3 hours
                                                </option>

                                            </select>

                                        </div>


                                        <div className="assignment-input session-focus">

                                            <label htmlFor="session-focus">
                                                Focus
                                            </label>

                                            <input
                                                id="session-focus"
                                                type="text"
                                                placeholder="e.g. React components"
                                                value={sessionFocus}
                                                onChange={(event) =>
                                                    setSessionFocus(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="assignment-actions">

                                            <button type="submit">
                                                Add session
                                            </button>

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={() => {
                                                    setShowSessionForm(false)
                                                    setSessionDay("")
                                                    setSessionTime("")
                                                    setSessionDuration("60")
                                                    setSessionFocus("")
                                                }}
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </form>

                                )}


                                {selectedSubject.studySessions.length === 0 ? (

                                    <div className="workspace-empty">

                                        <Clock3
                                            size={23}
                                            strokeWidth={1.5}
                                        />

                                        <div>

                                            <h3>
                                                No study sessions yet.
                                            </h3>

                                            <p>
                                                Choose when you want to spend time
                                                studying {selectedSubject.name}.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="session-list">

                                        {selectedSubject.studySessions.map(
                                            (session) => (

                                                <div
                                                    className={`session-row ${session.completed ? "completed" : ""}`}
                                                    key={session.id}
                                                >

                                                    <div className="session-time">

                                                        <span>
                                                            {formatDay(
                                                                session.day
                                                            )}
                                                        </span>

                                                        <strong>
                                                            {session.time}
                                                        </strong>

                                                    </div>


                                                    <button
                                                        className="assignment-check session-check"
                                                        type="button"
                                                        onClick={() => toggleStudySession(session.id)}
                                                        aria-label={session.completed ? "Mark study session as incomplete" : "Mark study session as complete"}
                                                    >
                                                        {session.completed && <Check size={14} />}
                                                    </button>

                                                    <div className="session-details">

                                                        <strong>
                                                            {session.focus}
                                                        </strong>

                                                        <span>
                                                            {session.duration}
                                                            {" minutes"}
                                                            {" · "}
                                                            {selectedSubject.name}
                                                        </span>

                                                    </div>


                                                    <button
                                                        className="delete-assignment"
                                                        type="button"
                                                        onClick={() =>
                                                            deleteStudySession(
                                                                session.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </section>

                        )}

                    </section>

                )
            )}


        </main >
    )

}


export default Dashboard