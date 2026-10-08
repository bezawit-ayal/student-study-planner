import { useMemo, useState } from "react"
import {
    AlertCircle,
    Bell,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock3,
    X
} from "lucide-react"

import "./notifications.css"

function Notifications({
    subjects = [],
    isOpen,
    onClose,
    onOpenSubject
}) {
    const [dismissed, setDismissed] = useState([])
    const notifications = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        function getDate(value) {
            if (!value) return null

            const parts = String(value).split("-")

            if (parts.length === 3) {
                const date = new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2])
                )

                date.setHours(0, 0, 0, 0)

                return date
            }

            const date = new Date(value)

            if (Number.isNaN(date.getTime())) {
                return null
            }

            date.setHours(0, 0, 0, 0)

            return date
        }

        function getDaysFromToday(date) {
            const oneDay = 24 * 60 * 60 * 1000

            return Math.round(
                (date.getTime() - today.getTime()) / oneDay
            )
        }

        function formatDate(date) {
            return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
            })
        }

        const items = []

        subjects.forEach((subject) => {
            const assignments = subject.assignments || []
            const exams = subject.exams || []
            const studySessions = subject.studySessions || []

            assignments.forEach((assignment) => {
                if (assignment.completed) return

                const date = getDate(
                    assignment.dueDate || assignment.date
                )

                if (!date) return

                const days = getDaysFromToday(date)

                if (days < 0) {
                    items.push({
                        id: `overdue-${subject.id}-${assignment.id}`,
                        type: "overdue",
                        label: "Overdue",
                        title: assignment.title,
                        subject: subject.name,
                        subjectId: subject.id,
                        message: `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1
                            ? "day"
                            : "days"
                            }`,
                        date: formatDate(date),
                        icon: AlertCircle,
                        priority: 1
                    })
                } else if (days === 0) {
                    items.push({
                        id: `today-${subject.id}-${assignment.id}`,
                        type: "today",
                        label: "Due today",
                        title: assignment.title,
                        subject: subject.name,
                        subjectId: subject.id,
                        message: "This assignment is due today",
                        date: "Today",
                        icon: CalendarDays,
                        priority: 2
                    })
                } else if (days <= 7) {
                    items.push({
                        id: `upcoming-${subject.id}-${assignment.id}`,
                        type: "upcoming",
                        label: "Upcoming",
                        title: assignment.title,
                        subject: subject.name,
                        subjectId: subject.id,
                        message:
                            days === 1
                                ? "Due tomorrow"
                                : `Due in ${days} days`,
                        date: formatDate(date),
                        icon: CalendarDays,
                        priority: 4
                    })
                }
            })

            exams.forEach((exam) => {
                const date = getDate(exam.date)

                if (!date) return

                const days = getDaysFromToday(date)

                if (days < 0 || days > 14) return

                items.push({
                    id: `exam-${subject.id}-${exam.id}`,
                    type: "exam",
                    label: "Exam",
                    title: exam.title,
                    subject: subject.name,
                    subjectId: subject.id,
                    message:
                        days === 0
                            ? "Exam today"
                            : days === 1
                                ? "Exam tomorrow"
                                : `Exam in ${days} days`,
                    date: formatDate(date),
                    time: exam.time,
                    icon: BookOpen,
                    priority: days <= 1 ? 2 : 3
                })
            })

            const todayName = today.toLocaleDateString(
                undefined,
                {
                    weekday: "long"
                }
            )

            studySessions.forEach((session) => {
                if (session.completed) return

                if (
                    String(session.day).toLowerCase() !==
                    todayName.toLowerCase()
                ) {
                    return
                }

                items.push({
                    id: `session-${subject.id}-${session.id}`,
                    type: "session",
                    label: "Study session",
                    title: session.focus || "Study session",
                    subject: subject.name,
                    subjectId: subject.id,
                    message: "Scheduled for today",
                    date: session.time
                        ? `Today at ${session.time}`
                        : "Today",
                    duration: session.duration,
                    icon: Clock3,
                    priority: 3
                })
            })
        })

        return items
            .filter(
                (item) => !dismissed.includes(item.id)
            )
            .sort(
                (a, b) => a.priority - b.priority
            )
    }, [subjects, dismissed])

    function dismissNotification(id) {
        setDismissed((current) => [
            ...current,
            id
        ])
    }

    function clearAll() {
        setDismissed((current) => [
            ...current,
            ...notifications.map(
                (notification) => notification.id
            )
        ])
    }

    function openNotification(notification) {
        if (onOpenSubject) {
            onOpenSubject(notification.subjectId)
        }

        if (onClose) {
            onClose()
        }
    }

    function toggleNotifications() {
        setIsOpen((current) => !current)
    }

    return (
        <div className="notifications-wrapper">

            {isOpen && (
                <div className="notification-dropdown">

                    <div className="notification-dropdown-header">

                        <div>
                            <h2>Notifications</h2>

                            <p>
                                {notifications.length > 0
                                    ? `${notifications.length} update${notifications.length === 1
                                        ? ""
                                        : "s"
                                    }`
                                    : "You're all caught up"}
                            </p>
                        </div>

                        {notifications.length > 0 && (
                            <button
                                type="button"
                                className="notification-clear"
                                onClick={clearAll}
                            >
                                Clear all
                            </button>
                        )}

                    </div>

                    {notifications.length === 0 ? (
                        <div className="notification-empty">

                            <div className="notification-empty-icon">
                                <CheckCircle2 size={22} />
                            </div>

                            <div>
                                <h3>
                                    All caught up
                                </h3>

                                <p>
                                    No important study updates right now.
                                </p>
                            </div>

                        </div>
                    ) : (
                        <div className="notification-items">

                            {notifications.map(
                                (notification) => {
                                    const Icon =
                                        notification.icon

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${notification.type}`}
                                            onClick={() =>
                                                openNotification(
                                                    notification
                                                )
                                            }
                                        >

                                            <div className="notification-item-icon">
                                                <Icon size={16} />
                                            </div>

                                            <div className="notification-item-body">

                                                <div className="notification-item-top">

                                                    <span>
                                                        {
                                                            notification.label
                                                        }
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="notification-dismiss"
                                                        aria-label="Dismiss notification"
                                                        onClick={(event) => {
                                                            event.stopPropagation()

                                                            dismissNotification(
                                                                notification.id
                                                            )
                                                        }}
                                                    >
                                                        <X size={13} />
                                                    </button>

                                                </div>

                                                <h3>
                                                    {
                                                        notification.title
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        notification.message
                                                    }
                                                </p>

                                                <div className="notification-item-meta">

                                                    <span>
                                                        {
                                                            notification.subject
                                                        }
                                                    </span>

                                                    <span>
                                                        {
                                                            notification.date
                                                        }

                                                        {notification.time &&
                                                            ` · ${notification.time}`}

                                                        {notification.duration &&
                                                            ` · ${notification.duration} min`}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>
                                    )
                                }
                            )}

                        </div>
                    )}

                </div>
            )}

        </div>
    )
}

export default Notifications

