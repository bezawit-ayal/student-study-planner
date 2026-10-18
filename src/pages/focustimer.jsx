import { useEffect, useMemo, useState } from "react"
import { BookOpen, Check, Clock3, Pause, Play, RotateCcw } from "lucide-react"
import useSubjects from "../hooks/useSubjects"
import useFocusTimer from "../contexts/useFocusTimer"
import { getFocusSessions } from "../services/studyflowservice"
import "./workspace-pages.css"

const presets = [25, 45, 60]
const circumference = 2 * Math.PI * 112

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0")
  const remainder = (seconds % 60).toString().padStart(2, "0")
  return `${minutes}:${remainder}`
}

function getId(item) {
  return item?._id || item?.id
}

export default function FocusTimerPage() {
  const {
    duration,
    remaining,
    running,
    subjectId,
    setSubjectId,
    pendingSave,
    saving,
    error,
    selectDuration,
    start,
    pause,
    reset,
    retrySave,
    retryWithoutSubject,
  } = useFocusTimer()
  const [customDuration, setCustomDuration] = useState("")
  const [sessions, setSessions] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState("")
  const { subjects, loading: subjectsLoading, error: subjectsError, reload } = useSubjects()

  useEffect(() => {
    const controller = new AbortController()
    getFocusSessions({ signal: controller.signal })
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setHistoryError(loadError.message || "Unable to load focus history.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false)
      })
    function addCompletedSession(event) {
      if (event.detail) setSessions((current) => [event.detail, ...current])
    }
    window.addEventListener("studyflow:focus-session-saved", addCompletedSession)
    return () => {
      controller.abort()
      window.removeEventListener("studyflow:focus-session-saved", addCompletedSession)
    }
  }, [])

  const progress = useMemo(
    () => Math.min(1, Math.max(0, (duration * 60 - remaining) / (duration * 60))),
    [duration, remaining],
  )
  const completedSessions = sessions.filter((session) => session.completed)
  const totalFocusedMinutes = completedSessions.reduce(
    (total, session) => total + (Number(session.duration) || 0),
    0,
  )
  const remainingMinutes = Math.floor(remaining / 60)
  const remainingSeconds = remaining % 60

  function applyCustomDuration(event) {
    event.preventDefault()
    const minutes = Number(customDuration)
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) return
    if (selectDuration(minutes)) setCustomDuration("")
  }

  return (
    <section className="focus-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">ONE THING AT A TIME</p>
          <h2>Focus Timer</h2>
          <p className="page-description">Set aside a little time for the work in front of you.</p>
        </div>
      </div>

      {(subjectsError || historyError) && (
        <div className="inline-alert" role="alert">
          <span>{subjectsError || historyError}</span>
          {subjectsError && <button type="button" onClick={reload}>Retry</button>}
          {historyError && (
            <button
              type="button"
              onClick={() => {
                setHistoryLoading(true)
                setHistoryError("")
                getFocusSessions()
                  .then((data) => setSessions(Array.isArray(data) ? data : []))
                  .catch((loadError) => setHistoryError(loadError.message || "Unable to load focus history."))
                  .finally(() => setHistoryLoading(false))
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="focus-layout">
        <section className="focus-panel" aria-label="Focus timer controls">
          <p className="focus-panel-eyebrow">
            <span className="focus-status-dot" />
            {running ? "SESSION IN PROGRESS" : pendingSave ? "SESSION COMPLETE" : "A MOMENT TO FOCUS"}
          </p>
          <div
            className="timer-face"
            role="timer"
            aria-live="off"
            aria-label={`${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"} ${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"} remaining`}
          >
            <svg viewBox="0 0 240 240" aria-hidden="true">
              <circle className="timer-track" cx="120" cy="120" r="112" />
              <circle
                className="timer-progress"
                cx="120"
                cy="120"
                r="112"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
              />
            </svg>
            <div className="timer-face-content">
              <span>{formatDuration(remaining)}</span>
              <small>MINUTES : SECONDS</small>
            </div>
          </div>

          <div className="timer-presets" aria-label="Timer duration">
            {presets.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={duration === minutes ? "active" : ""}
                aria-pressed={duration === minutes}
                disabled={running || saving || Boolean(pendingSave)}
                onClick={() => selectDuration(minutes)}
              >
                {minutes} min
              </button>
            ))}
          </div>

          <form className="custom-duration-form" onSubmit={applyCustomDuration}>
            <label htmlFor="custom-duration">Custom duration</label>
            <div>
              <input
                id="custom-duration"
                type="number"
                min="1"
                max="180"
                value={customDuration}
                onChange={(event) => setCustomDuration(event.target.value)}
                placeholder="1–180"
                disabled={running || saving || Boolean(pendingSave)}
              />
              <button className="secondary-button" type="submit" disabled={running || saving || Boolean(pendingSave)}>Apply</button>
            </div>
          </form>

          <label className="focus-subject-label" htmlFor="focus-subject">
            Study subject <span>Optional</span>
          </label>
          <select
            id="focus-subject"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            disabled={running || subjectsLoading || saving || Boolean(pendingSave)}
          >
            <option value="">No subject selected</option>
            {subjects.map((subject) => (
              <option key={getId(subject)} value={getId(subject)}>{subject.name}</option>
            ))}
          </select>

          <div className="timer-actions">
            {running ? (
              <button className="primary-button" type="button" onClick={pause}>
                <Pause size={17} aria-hidden="true" /> Pause
              </button>
            ) : remaining > 0 ? (
              <button className="primary-button" type="button" onClick={start} disabled={saving || Boolean(pendingSave)}>
                <Play size={17} aria-hidden="true" /> {remaining < duration * 60 ? "Resume focus" : "Start focus"}
              </button>
            ) : (
              <span className="timer-saved-label">
                {saving ? "Saving your session…" : pendingSave ? "Session needs saving" : "Session saved"}
              </span>
            )}
            <button className="secondary-button" type="button" onClick={reset} disabled={running || saving || Boolean(pendingSave)}>
              <RotateCcw size={16} aria-hidden="true" /> Reset
            </button>
          </div>

          {error && (
            <div className="inline-alert focus-alert" role="alert">
              <span>{error}</span>
              {pendingSave && (
                <>
                  <button type="button" onClick={retrySave} disabled={saving}>Retry save</button>
                  {pendingSave.subjectId && (
                    <button type="button" onClick={retryWithoutSubject} disabled={saving}>Save without subject</button>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <aside className="focus-history">
          <div>
            <p className="section-eyebrow">YOUR PRACTICE</p>
            <h3>Recent focus</h3>
          </div>
          <div className="focus-history-totals">
            <div><strong>{completedSessions.length}</strong><span>sessions completed</span></div>
            <div><strong>{totalFocusedMinutes}</strong><span>minutes focused</span></div>
          </div>
          {historyLoading ? (
            <p className="workspace-loading" role="status">Loading your sessions…</p>
          ) : completedSessions.length === 0 ? (
            <div className="focus-history-empty">
              <BookOpen size={19} aria-hidden="true" />
              <p>Your completed sessions will show up here.</p>
            </div>
          ) : (
            <ul className="focus-history-list">
              {completedSessions.slice(0, 6).map((session) => (
                <li key={getId(session)}>
                  <span className="focus-history-check"><Check size={14} aria-hidden="true" /></span>
                  <span>
                    <strong>{session.duration} minutes</strong>
                    <small>{new Date(session.endedAt || session.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small>
                  </span>
                  <Clock3 size={15} aria-hidden="true" />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  )
}
