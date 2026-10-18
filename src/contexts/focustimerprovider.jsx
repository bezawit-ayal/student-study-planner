import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createFocusSession } from "../services/studyflowservice"
import { FocusTimerContext } from "./focusTimerContext"
const standardDurations = [25, 45, 60]

function getDefaultDuration() {
  try {
    const preferences = JSON.parse(localStorage.getItem("studyflow-preferences") || "{}")
    const duration = Number(preferences.focusDuration)
    return standardDurations.includes(duration) ? duration : 25
  } catch {
    return 25
  }
}

export function FocusTimerProvider({ children }) {
  const [duration, setDuration] = useState(getDefaultDuration)
  const [remaining, setRemaining] = useState(() => getDefaultDuration() * 60)
  const [running, setRunning] = useState(false)
  const [subjectId, setSubjectId] = useState("")
  const [pendingSave, setPendingSave] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const startedAt = useRef(null)
  const targetEnd = useRef(null)
  const savedCompletion = useRef(false)

  const saveSession = useCallback(async (sessionDetails) => {
    setPendingSave(sessionDetails)
    setSaving(true)
    setError("")
    try {
      const session = await createFocusSession({ ...sessionDetails, completed: true })
      setPendingSave(null)
      window.dispatchEvent(new CustomEvent("studyflow:focus-session-saved", { detail: session }))
    } catch (saveError) {
      setError(saveError.message || "The session finished but could not be saved.")
    } finally {
      setSaving(false)
    }
  }, [])

  const completeSession = useCallback(() => {
    setRunning(false)
    if (savedCompletion.current) return
    savedCompletion.current = true
    saveSession({
      duration,
      subjectId: subjectId || null,
      startedAt: startedAt.current.toISOString(),
      endedAt: new Date().toISOString(),
    })
  }, [duration, saveSession, subjectId])

  useEffect(() => {
    if (!running) return undefined
    const interval = window.setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((targetEnd.current - Date.now()) / 1000))
      setRemaining(secondsLeft)
      if (secondsLeft === 0) completeSession()
    }, 500)
    return () => window.clearInterval(interval)
  }, [completeSession, running])

  useEffect(() => {
    function applyPreferences(event) {
      const nextDuration = Number(event.detail?.focusDuration)
      if (standardDurations.includes(nextDuration) && !running && !pendingSave && !saving) {
        setDuration(nextDuration)
        setRemaining(nextDuration * 60)
      }
    }
    window.addEventListener("studyflow:preferences-updated", applyPreferences)
    return () => window.removeEventListener("studyflow:preferences-updated", applyPreferences)
  }, [pendingSave, running, saving])

  const selectDuration = useCallback((minutes) => {
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
      setError("Choose a session between 1 and 180 minutes.")
      return false
    }
    if (running || saving || pendingSave) return false
    setDuration(minutes)
    setRemaining(minutes * 60)
    setError("")
    savedCompletion.current = false
    return true
  }, [pendingSave, running, saving])

  const start = useCallback(() => {
    if (remaining <= 0 || saving || pendingSave) return
    if (!startedAt.current) startedAt.current = new Date()
    targetEnd.current = Date.now() + remaining * 1000
    setError("")
    setRunning(true)
  }, [pendingSave, remaining, saving])

  const pause = useCallback(() => {
    if (!targetEnd.current) return
    const secondsLeft = Math.max(0, Math.ceil((targetEnd.current - Date.now()) / 1000))
    setRemaining(secondsLeft)
    if (secondsLeft === 0) {
      completeSession()
      return
    }
    setRunning(false)
  }, [completeSession])

  const reset = useCallback(() => {
    if (running || saving || pendingSave) return
    setRemaining(duration * 60)
    startedAt.current = null
    targetEnd.current = null
    savedCompletion.current = false
    setError("")
  }, [duration, pendingSave, running, saving])

  const retrySave = useCallback(() => {
    if (pendingSave && !saving) saveSession(pendingSave)
  }, [pendingSave, saveSession, saving])

  const retryWithoutSubject = useCallback(() => {
    if (pendingSave && !saving) saveSession({ ...pendingSave, subjectId: null })
  }, [pendingSave, saveSession, saving])

  const value = useMemo(() => ({
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
  }), [
    duration,
    error,
    pendingSave,
    pause,
    remaining,
    reset,
    retryWithoutSubject,
    retrySave,
    running,
    saving,
    selectDuration,
    start,
    subjectId,
  ])

  return (
    <FocusTimerContext.Provider value={value}>
      {children}
    </FocusTimerContext.Provider>
  )
}
