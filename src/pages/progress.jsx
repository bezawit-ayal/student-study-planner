import { useEffect, useMemo, useState } from "react"
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3 } from "lucide-react"
import { Link } from "react-router-dom"
import useSubjects from "../hooks/useSubjects"
import { getFocusSessions } from "../services/studyflowservice"
import "./workspace-pages.css"

function getId(item) {
  return item?._id || item?.id
}

function localDayKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function ProgressPage() {
  const { subjects, loading: subjectsLoading, error: subjectsError, reload } = useSubjects()
  const [focusSessions, setFocusSessions] = useState([])
  const [focusLoading, setFocusLoading] = useState(true)
  const [focusError, setFocusError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    getFocusSessions({ signal: controller.signal })
      .then((data) => setFocusSessions(Array.isArray(data) ? data : []))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setFocusError(error.message || "Unable to load focus activity.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setFocusLoading(false)
      })
    return () => controller.abort()
  }, [])

  const assignments = useMemo(
    () => subjects.flatMap((subject) =>
      (subject.assignments || []).map((assignment) => ({
        ...assignment,
        subjectName: subject.name,
        id: getId(assignment),
      })),
    ),
    [subjects],
  )
  const exams = useMemo(
    () => subjects.flatMap((subject) =>
      (subject.exams || []).map((exam) => ({ ...exam, subjectName: subject.name })),
    ),
    [subjects],
  )
  const completedAssignments = assignments.filter((assignment) => assignment.completed).length
  const completionRate = assignments.length
    ? Math.round((completedAssignments / assignments.length) * 100)
    : 0
  const completedFocusSessions = focusSessions.filter((session) => session.completed)
  const focusedMinutes = completedFocusSessions.reduce(
    (total, session) => total + (Number(session.duration) || 0),
    0,
  )

  const weeklyActivity = useMemo(() => {
    const today = new Date()
    const days = []
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today)
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - offset)
      days.push({ date, minutes: 0 })
    }
    const dayTotals = new Map(days.map((day) => [localDayKey(day.date), day]))
    completedFocusSessions.forEach((session) => {
      const sessionDate = new Date(session.endedAt || session.createdAt)
      if (Number.isNaN(sessionDate.getTime())) return
      const day = dayTotals.get(localDayKey(sessionDate))
      if (day) day.minutes += Number(session.duration) || 0
    })
    return days
  }, [completedFocusSessions])
  const maxDailyMinutes = Math.max(...weeklyActivity.map((day) => day.minutes), 1)

  const upcomingExams = exams
    .filter((exam) => exam.date && new Date(exam.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((left, right) => new Date(left.date) - new Date(right.date))
    .slice(0, 4)

  return (
    <section className="progress-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">A RECORD OF YOUR WORK</p>
          <h2>Progress</h2>
          <p className="page-description">A clear picture of the work you have tracked so far.</p>
        </div>
      </div>

      {(subjectsError || focusError) && (
        <div className="inline-alert" role="alert">
          <span>{subjectsError || focusError}</span>
          <button type="button" onClick={() => { reload(); setFocusLoading(true); setFocusError(""); getFocusSessions().then((data) => setFocusSessions(Array.isArray(data) ? data : [])).catch((error) => setFocusError(error.message || "Unable to load focus activity.")).finally(() => setFocusLoading(false)) }}>Retry</button>
        </div>
      )}

      {subjectsLoading || focusLoading ? (
        <div className="workspace-loading" role="status">Gathering your study activity…</div>
      ) : (
        <>
          <div className="progress-summary">
            <article>
              <span className="progress-summary-icon"><CheckCircle2 size={19} aria-hidden="true" /></span>
              <div><span>Assignments completed</span><strong>{completedAssignments} <small>of {assignments.length}</small></strong></div>
            </article>
            <article>
              <span className="progress-summary-icon"><Clock3 size={19} aria-hidden="true" /></span>
              <div><span>Focused time</span><strong>{focusedMinutes} <small>minutes</small></strong></div>
            </article>
            <article>
              <span className="progress-summary-icon"><BookOpen size={19} aria-hidden="true" /></span>
              <div><span>Subjects in your plan</span><strong>{subjects.length}</strong></div>
            </article>
          </div>

          <div className="progress-content-grid">
            <section className="progress-panel">
              <div className="progress-panel-heading">
                <div><p className="section-eyebrow">LAST SEVEN DAYS</p><h3>Focus activity</h3></div>
                <span>{completedFocusSessions.length} total sessions</span>
              </div>
              {completedFocusSessions.length === 0 ? (
                <div className="progress-empty">
                  <p>Completed focus sessions will build your weekly activity here.</p>
                  <Link className="text-link" to="/focustimer">Open focus timer <ArrowRight size={15} aria-hidden="true" /></Link>
                </div>
              ) : (
                <div className="weekly-chart" role="img" aria-label="Daily completed focus minutes for the last seven days">
                  {weeklyActivity.map(({ date, minutes }) => (
                    <div className="weekly-chart-column" key={localDayKey(date)} title={`${minutes} focused minutes`}>
                      <div className="weekly-chart-bar-track">
                        <span style={{ height: `${minutes ? Math.max(5, minutes / maxDailyMinutes * 100) : 0}%` }} />
                      </div>
                      <strong>{minutes || ""}</strong>
                      <small>{date.toLocaleDateString(undefined, { weekday: "short" })}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="progress-panel completion-panel">
              <div><p className="section-eyebrow">COURSEWORK</p><h3>Assignment completion</h3></div>
              <div className="completion-track" role="progressbar" aria-label="Assignment completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completionRate}>
                <span style={{ width: `${completionRate}%` }} />
              </div>
              <p>{assignments.length ? `${completionRate}% of your tracked assignments are complete.` : "Add assignments to see your completion progress."}</p>
              <Link className="text-link" to="/assignments">View assignments <ArrowRight size={15} aria-hidden="true" /></Link>
            </section>

            <section className="progress-panel upcoming-exams-panel">
              <div className="progress-panel-heading">
                <div><p className="section-eyebrow">ON THE HORIZON</p><h3>Upcoming exams</h3></div>
                <Link className="text-link" to="/exams">All exams <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
              {upcomingExams.length ? (
                <ul className="upcoming-exams-list">
                  {upcomingExams.map((exam, index) => (
                    <li key={`${exam.subjectName}-${exam._id || exam.title}-${index}`}>
                      <CalendarDays size={16} aria-hidden="true" />
                      <span><strong>{exam.title}</strong><small>{exam.subjectName}</small></span>
                      <time dateTime={new Date(exam.date).toISOString()}>{new Date(exam.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="progress-empty-copy">There are no upcoming exams in your subject plans.</p>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  )
}
