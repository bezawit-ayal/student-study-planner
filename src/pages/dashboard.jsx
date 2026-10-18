import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Plus,
} from "lucide-react"
import { Link } from "react-router-dom"
import useSubjects from "../hooks/useSubjects"
import { getFocusSessions } from "../services/studyflowservice"
import "./workspace-pages.css"

function localDayKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getId(item) {
  return item?._id || item?.id
}

function formatDate(value) {
  if (!value) return "Date not set"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export default function Dashboard() {
  const { subjects, loading: subjectsLoading, error: subjectsError, reload } = useSubjects()
  const [focusSessions, setFocusSessions] = useState([])
  const [focusLoading, setFocusLoading] = useState(true)
  const [focusError, setFocusError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    getFocusSessions({ signal: controller.signal })
      .then((data) => setFocusSessions(Array.isArray(data) ? data : []))
      .catch((error) => {
        if (!controller.signal.aborted) setFocusError(error.message || "Unable to load focus sessions.")
      })
      .finally(() => {
        if (!controller.signal.aborted) setFocusLoading(false)
      })
    return () => controller.abort()
  }, [])

  const assignments = useMemo(
    () => subjects.flatMap((subject) =>
      (subject.assignments || []).map((item) => ({
        ...item,
        id: getId(item),
        subjectId: getId(subject),
        subjectName: subject.name,
        kind: "assignment",
      })),
    ),
    [subjects],
  )
  const exams = useMemo(
    () => subjects.flatMap((subject) =>
      (subject.exams || []).map((item) => ({
        ...item,
        subjectName: subject.name,
        kind: "exam",
      })),
    ),
    [subjects],
  )
  const pendingAssignments = assignments.filter((item) => !item.completed)
  const upcomingItems = [...pendingAssignments, ...exams]
    .filter((item) => {
      const date = item.kind === "assignment" ? item.dueDate : item.date
      return date && !Number.isNaN(new Date(date).getTime())
    })
    .sort((left, right) => {
      const leftDate = new Date(left.kind === "assignment" ? left.dueDate : left.date)
      const rightDate = new Date(right.kind === "assignment" ? right.dueDate : right.date)
      return leftDate - rightDate
    })
    .slice(0, 5)

  const todayKey = localDayKey(new Date())
  const todaySessions = subjects.flatMap((subject) =>
    (subject.studySessions || [])
      .filter((session) => localDayKey(session.date) === todayKey)
      .map((session) => ({ ...session, subjectName: subject.name })),
  )
  const todayFocusMinutes = focusSessions
    .filter((session) => session.completed && localDayKey(session.endedAt || session.createdAt) === todayKey)
    .reduce((total, session) => total + (Number(session.duration) || 0), 0)

  function retryOverview() {
    reload()
    setFocusLoading(true)
    setFocusError("")
    getFocusSessions()
      .then((data) => setFocusSessions(Array.isArray(data) ? data : []))
      .catch((error) => setFocusError(error.message || "Unable to load focus sessions."))
      .finally(() => setFocusLoading(false))
  }

  return (
    <section className="overview-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">A CLEAR VIEW OF YOUR SEMESTER</p>
          <h2>Welcome to your workspace</h2>
          <p className="page-description">
            Start with what needs your attention today. The plan can change as you do.
          </p>
        </div>
        <Link className="text-link" to="/subjects">
          Manage subjects <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {(subjectsError || focusError) && (
        <div className="inline-alert" role="alert">
          <span>{subjectsError || focusError}</span>
          <button type="button" onClick={retryOverview}>Retry</button>
        </div>
      )}

      <div className="dashboard-summary">
        <article className="overview-card">
          <span className="overview-card-icon"><BookOpen size={19} aria-hidden="true" /></span>
          <span className="overview-card-label">Subjects</span>
          <strong>{subjectsLoading ? "—" : subjects.length}</strong>
          <Link to="/subjects">View subjects <ArrowRight size={14} aria-hidden="true" /></Link>
        </article>
        <article className="overview-card">
          <span className="overview-card-icon"><ClipboardCheck size={19} aria-hidden="true" /></span>
          <span className="overview-card-label">To-do assignments</span>
          <strong>{subjectsLoading ? "—" : pendingAssignments.length}</strong>
          <Link to="/assignments">Review assignments <ArrowRight size={14} aria-hidden="true" /></Link>
        </article>
        <article className="overview-card">
          <span className="overview-card-icon"><GraduationCap size={19} aria-hidden="true" /></span>
          <span className="overview-card-label">Exams planned</span>
          <strong>{subjectsLoading ? "—" : exams.length}</strong>
          <Link to="/exams">Open exam plan <ArrowRight size={14} aria-hidden="true" /></Link>
        </article>
        <article className="overview-card">
          <span className="overview-card-icon"><Clock3 size={19} aria-hidden="true" /></span>
          <span className="overview-card-label">Focus minutes today</span>
          <strong>{focusLoading ? "—" : todayFocusMinutes}</strong>
          <Link to="/focustimer">Start a session <ArrowRight size={14} aria-hidden="true" /></Link>
        </article>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div><p className="section-eyebrow">COMING UP</p><h3>On your calendar</h3></div>
            <Link className="text-link" to="/assignments">All coursework <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {subjectsLoading ? (
            <p className="workspace-loading" role="status">Loading your coursework…</p>
          ) : upcomingItems.length ? (
            <ul className="dashboard-upcoming-list">
              {upcomingItems.map((item, index) => {
                const date = item.kind === "assignment" ? item.dueDate : item.date
                const Icon = item.kind === "assignment" ? ClipboardCheck : GraduationCap
                return (
                  <li key={`${item.kind}-${getId(item) || item.title}-${index}`}>
                    <span className="dashboard-list-icon"><Icon size={16} aria-hidden="true" /></span>
                    <span className="dashboard-item-copy">
                      <strong>{item.title}</strong>
                      <small>{item.subjectName} · {item.kind === "assignment" ? "Assignment" : "Exam"}</small>
                    </span>
                    <time dateTime={new Date(date).toISOString()}>{formatDate(date)}</time>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="dashboard-empty-inline">
              <CheckCircle2 size={18} aria-hidden="true" />
              <p>No dated assignments or exams are coming up. Add a due date when you have one.</p>
            </div>
          )}
        </section>

        <section className="dashboard-section dashboard-today">
          <div className="dashboard-section-heading">
            <div><p className="section-eyebrow">TODAY</p><h3>Study plan</h3></div>
            <Link className="text-link" to="/studyplan">View plan <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {subjectsLoading ? (
            <p className="workspace-loading" role="status">Loading today's plan…</p>
          ) : todaySessions.length ? (
            <ul className="dashboard-today-list">
              {todaySessions.map((session, index) => (
                <li key={getId(session) || `${session.title}-${index}`}>
                  <CalendarDays size={16} aria-hidden="true" />
                  <span><strong>{session.title}</strong><small>{session.subjectName}</small></span>
                  {session.duration > 0 && <time>{session.duration} min</time>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty-inline">
              <p>Nothing planned for today. You can add one small session whenever you’re ready.</p>
            </div>
          )}
          <div className="dashboard-quick-actions">
            <Link to="/subjects"><Plus size={15} aria-hidden="true" /> Add subject</Link>
            <Link to="/assignments"><Plus size={15} aria-hidden="true" /> Add assignment</Link>
            <Link to="/studyplan"><Plus size={15} aria-hidden="true" /> Plan a session</Link>
          </div>
        </section>
      </div>
    </section>
  )
}
