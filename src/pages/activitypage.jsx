import { useMemo, useState } from "react"
import { BookOpen, CalendarDays, Clock3, Pencil, Plus, Trash2, X } from "lucide-react"
import { Link } from "react-router-dom"
import useSubjects from "../hooks/useSubjects"
import {
  createSubjectItem,
  deleteSubjectItem,
  updateSubjectItem,
} from "../services/studyflowservice"
import "./workspace-pages.css"

const pageConfig = {
  exams: {
    title: "Exams",
    eyebrow: "PREPARE WITH A PLAN",
    description: "See upcoming exams alongside the subjects and dates that matter.",
    collection: "exams",
    emptyTitle: "Your exam calendar is clear",
    emptyDescription: "Add an exam to keep important dates and revision notes in one place.",
    createLabel: "Add exam",
    itemTitle: "Exam",
  },
  "study-sessions": {
    title: "Study Plan",
    eyebrow: "MAKE TIME FOR LEARNING",
    description: "Plan focused study blocks around the subjects you are taking.",
    collection: "studySessions",
    emptyTitle: "Start with one study block",
    emptyDescription: "Add a session to build a study plan that fits your week.",
    createLabel: "Plan a session",
    itemTitle: "Study session",
  },
}

function getId(item) {
  return item?._id || item?.id
}

function toDateInputValue(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

function formatDate(value) {
  if (!value) return "Date not set"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
}

function createForm(resource, subjectId = "", item = null) {
  return {
    subjectId: subjectId || "",
    title: item?.title || "",
    date: toDateInputValue(item?.date),
    time: item?.time || "",
    duration: item?.duration ? String(item.duration) : "45",
    notes: item?.notes || "",
  }
}

export default function SubjectActivityPage({ resource }) {
  const config = pageConfig[resource]
  const { subjects, setSubjects, loading, error, reload } = useSubjects()
  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(() => createForm(resource))
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const [pendingId, setPendingId] = useState("")
  const isStudySession = resource === "study-sessions"
  const key = isStudySession ? "studySessions" : "exams"

  const activities = useMemo(
    () => subjects.flatMap((subject) =>
      (subject[key] || []).map((item) => ({
        ...item,
        id: getId(item),
        subjectId: getId(subject),
        subjectName: subject.name,
        subjectColor: subject.color || "#174d36",
      })),
    ),
    [key, subjects],
  )

  const visibleActivities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return activities
      .filter((item) =>
        !query ||
        item.title.toLocaleLowerCase().includes(query) ||
        item.subjectName.toLocaleLowerCase().includes(query),
      )
      .sort((left, right) => {
        if (!left.date) return right.date ? 1 : 0
        if (!right.date) return -1
        return new Date(left.date) - new Date(right.date)
      })
  }, [activities, search])

  function openCreateForm() {
    setEditing(null)
    setForm(createForm(resource, subjects[0] ? getId(subjects[0]) : ""))
    setFormError("")
    setIsFormOpen(true)
  }

  function openEditForm(item) {
    setEditing(item)
    setForm(createForm(resource, item.subjectId, item))
    setFormError("")
    setIsFormOpen(true)
  }

  function closeForm() {
    if (!saving) {
      setIsFormOpen(false)
      setEditing(null)
      setFormError("")
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.subjectId) {
      setFormError("Choose a subject for this item.")
      return
    }
    if (!form.title.trim()) {
      setFormError("Enter a title.")
      return
    }
    if (isStudySession && (!Number.isInteger(Number(form.duration)) ||
      Number(form.duration) < 1 || Number(form.duration) > 1440)) {
      setFormError("Choose a duration between 1 and 1,440 minutes.")
      return
    }

    const payload = {
      title: form.title.trim(),
      date: form.date ? new Date(`${form.date}T12:00:00`).toISOString() : null,
      notes: form.notes.trim(),
    }
    if (isStudySession) payload.duration = Number(form.duration)
    else payload.time = form.time

    setSaving(true)
    setFormError("")
    try {
      if (editing) {
        const updated = await updateSubjectItem(
          editing.subjectId,
          resource,
          editing.id,
          payload,
        )
        setSubjects((current) => current.map((subject) =>
          getId(subject) === editing.subjectId
            ? {
                ...subject,
                [key]: (subject[key] || []).map((item) =>
                  getId(item) === editing.id ? updated : item,
                ),
              }
            : subject,
        ))
      } else {
        const created = await createSubjectItem(form.subjectId, resource, payload)
        setSubjects((current) => current.map((subject) =>
          getId(subject) === form.subjectId
            ? { ...subject, [key]: [...(subject[key] || []), created] }
            : subject,
        ))
      }
      setIsFormOpen(false)
      setEditing(null)
    } catch (saveError) {
      setFormError(saveError.message || `Unable to save this ${config.itemTitle.toLocaleLowerCase()}.`)
    } finally {
      setSaving(false)
    }
  }

  async function removeActivity(item) {
    if (!window.confirm(`Delete "${item.title}"?`)) return
    setPendingId(item.id)
    try {
      await deleteSubjectItem(item.subjectId, resource, item.id)
      setSubjects((current) => current.map((subject) =>
        getId(subject) === item.subjectId
          ? {
              ...subject,
              [key]: (subject[key] || []).filter((entry) => getId(entry) !== item.id),
            }
          : subject,
      ))
    } catch (deleteError) {
      setFormError(deleteError.message || `Unable to delete this ${config.itemTitle.toLocaleLowerCase()}.`)
    } finally {
      setPendingId("")
    }
  }

  return (
    <section className="activity-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">{config.eyebrow}</p>
          <h2>{config.title}</h2>
          <p className="page-description">{config.description}</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={openCreateForm}
          disabled={subjects.length === 0}
        >
          <Plus size={17} aria-hidden="true" /> {config.createLabel}
        </button>
      </div>

      {error && (
        <div className="inline-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={reload}>Retry</button>
        </div>
      )}

      {formError && !isFormOpen && (
        <div className="inline-alert" role="alert">
          <span>{formError}</span>
          <button type="button" onClick={() => setFormError("")}>Dismiss</button>
        </div>
      )}

      {subjects.length === 0 && !loading && !error ? (
        <div className="workspace-empty">
          <BookOpen size={23} strokeWidth={1.6} aria-hidden="true" />
          <h3>Add a subject first</h3>
          <p>{isStudySession ? "Study sessions" : "Exams"} are organized with the subjects they belong to.</p>
          <Link className="secondary-button" to="/subjects">View subjects</Link>
        </div>
      ) : loading ? (
        <div className="workspace-loading" role="status">Loading {config.title.toLocaleLowerCase()}…</div>
      ) : (
        <>
          <div className="activity-toolbar">
            <span>{visibleActivities.length} {visibleActivities.length === 1 ? "item" : "items"}</span>
            <label>
              <span className="visually-hidden">Search {config.title.toLocaleLowerCase()}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${config.title.toLocaleLowerCase()}`}
              />
            </label>
          </div>

          {visibleActivities.length === 0 ? (
            <div className="workspace-empty">
              <CalendarDays size={23} strokeWidth={1.6} aria-hidden="true" />
              <h3>{activities.length ? "No matching items" : config.emptyTitle}</h3>
              <p>{activities.length ? "Try another search." : config.emptyDescription}</p>
              {!activities.length && subjects.length > 0 && (
                <button className="secondary-button" type="button" onClick={openCreateForm}>
                  {config.createLabel}
                </button>
              )}
            </div>
          ) : (
            <div className="activity-list">
              {visibleActivities.map((item) => (
                <article className="activity-row" key={`${item.subjectId}-${item.id}`}>
                  <span
                    className="activity-date-marker"
                    style={{ "--subject-color": item.subjectColor }}
                    aria-hidden="true"
                  />
                  <div className="activity-main">
                    <h3>{item.title}</h3>
                    <span className="activity-subject">{item.subjectName}</span>
                    {item.notes && <p className="activity-notes">{item.notes}</p>}
                  </div>
                  <div className="activity-date">
                    <CalendarDays size={15} aria-hidden="true" />
                    <span>{formatDate(item.date)}</span>
                    {!isStudySession && item.time && <span>{item.time}</span>}
                    {isStudySession && item.duration > 0 && (
                      <span><Clock3 size={13} aria-hidden="true" /> {item.duration} min</span>
                    )}
                  </div>
                  <div className="activity-actions">
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Edit ${item.title}`}
                      onClick={() => openEditForm(item)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      aria-label={`Delete ${item.title}`}
                      disabled={pendingId === item.id}
                      onClick={() => removeActivity(item)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {isFormOpen && (
        <div className="modal-backdrop" onMouseDown={closeForm}>
          <section
            className="activity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="section-eyebrow">{config.title.toLocaleUpperCase()}</p>
                <h2 id="activity-form-title">{editing ? `Edit ${config.itemTitle.toLocaleLowerCase()}` : config.createLabel}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close form" onClick={closeForm} disabled={saving}>
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="activity-title">Title</label>
              <input
                id="activity-title"
                autoFocus
                maxLength={120}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder={isStudySession ? "e.g. Review lecture notes" : "e.g. Biology midterm"}
                required
              />

              <label className="field-label" htmlFor="activity-subject">Subject</label>
              <select
                id="activity-subject"
                value={form.subjectId}
                onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}
                required
              >
                <option value="" disabled>Choose a subject</option>
                {subjects.map((subject) => (
                  <option value={getId(subject)} key={getId(subject)}>{subject.name}</option>
                ))}
              </select>

              <div className="activity-form-row">
                <div>
                  <label className="field-label" htmlFor="activity-date">{isStudySession ? "Study date" : "Exam date"}</label>
                  <input
                    id="activity-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  />
                </div>
                {isStudySession ? (
                  <div>
                    <label className="field-label" htmlFor="activity-duration">Duration (minutes)</label>
                    <input
                      id="activity-duration"
                      type="number"
                      min="1"
                      max="1440"
                      value={form.duration}
                      onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="field-label" htmlFor="activity-time">Exam time</label>
                    <input
                      id="activity-time"
                      type="time"
                      value={form.time}
                      onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                    />
                  </div>
                )}
              </div>

              <label className="field-label" htmlFor="activity-notes">Notes <span>Optional</span></label>
              <textarea
                id="activity-notes"
                rows={3}
                maxLength={1000}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder={isStudySession ? "What would you like to work on?" : "Topics to review or other details"}
              />

              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={closeForm} disabled={saving}>Cancel</button>
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save changes" : config.createLabel}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
