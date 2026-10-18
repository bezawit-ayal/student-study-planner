import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Check, Circle, Pencil, Plus, Trash2, X } from "lucide-react"
import { Link } from "react-router-dom"
import {
  createSubjectItem,
  deleteSubjectItem,
  getSubjects,
  updateSubjectItem,
} from "../services/studyflowservice"
import "./assignmentspage.css"

const priorities = ["low", "medium", "high"]

function getId(item) {
  return item._id || item.id
}

function toDateInputValue(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function formatDueDate(value) {
  if (!value) return "No due date"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Invalid due date"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
}

function isOverdue(assignment) {
  if (assignment.completed || !assignment.dueDate) return false
  const dueDate = new Date(assignment.dueDate)
  if (Number.isNaN(dueDate.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
}

function createAssignmentForm(assignment, subjectId) {
  return {
    subjectId: subjectId || "",
    title: assignment?.title || "",
    description: assignment?.description || "",
    dueDate: toDateInputValue(assignment?.dueDate),
    priority: assignment?.priority || "medium",
  }
}

export default function AssignmentsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(() => createAssignmentForm())
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const [pendingId, setPendingId] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    getSubjects({ signal: controller.signal })
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadError(error.message || "Unable to load assignments.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const assignments = useMemo(
    () =>
      subjects.flatMap((subject) =>
        (subject.assignments || []).map((assignment) => ({
          ...assignment,
          id: getId(assignment),
          subjectId: getId(subject),
          subjectName: subject.name,
          subjectColor: subject.color || "#174d36",
        })),
      ),
    [subjects],
  )

  const visibleAssignments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return assignments
      .filter((assignment) => {
        if (filter === "pending" && assignment.completed) return false
        if (filter === "completed" && !assignment.completed) return false
        if (filter === "overdue" && !isOverdue(assignment)) return false
        return (
          !normalizedSearch ||
          assignment.title.toLocaleLowerCase().includes(normalizedSearch) ||
          assignment.subjectName.toLocaleLowerCase().includes(normalizedSearch)
        )
      })
      .sort((left, right) => {
        if (!left.dueDate) return right.dueDate ? 1 : 0
        if (!right.dueDate) return -1
        return new Date(left.dueDate) - new Date(right.dueDate)
      })
  }, [assignments, filter, search])

  function openCreateForm() {
    setEditing(null)
    setForm(createAssignmentForm(null, subjects[0] ? getId(subjects[0]) : ""))
    setFormError("")
    setIsFormOpen(true)
  }

  function openEditForm(assignment) {
    setEditing(assignment)
    setForm(createAssignmentForm(assignment, assignment.subjectId))
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

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const title = form.title.trim()

    if (!form.subjectId) {
      setFormError("Choose a subject for this assignment.")
      return
    }
    if (!title) {
      setFormError("Enter an assignment title.")
      return
    }
    if (!priorities.includes(form.priority)) {
      setFormError("Choose a valid priority.")
      return
    }

    const payload = {
      title,
      description: form.description.trim(),
      dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`).toISOString() : null,
      priority: form.priority,
      completed: editing?.completed || false,
    }

    setSaving(true)
    setFormError("")
    try {
      if (editing) {
        await updateSubjectItem(
          editing.subjectId,
          "assignments",
          editing.id,
          payload,
        )
        setSubjects((current) =>
          current.map((subject) =>
            getId(subject) === editing.subjectId
              ? {
                  ...subject,
                  assignments: (subject.assignments || []).map((item) =>
                    getId(item) === editing.id ? { ...item, ...payload } : item,
                  ),
                }
              : subject,
          ),
        )
      } else {
        const created = await createSubjectItem(
          form.subjectId,
          "assignments",
          payload,
        )
        setSubjects((current) =>
          current.map((subject) =>
            getId(subject) === form.subjectId
              ? { ...subject, assignments: [...(subject.assignments || []), created] }
              : subject,
          ),
        )
      }
      setIsFormOpen(false)
      setEditing(null)
    } catch (error) {
      setFormError(error.message || "Unable to save the assignment.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleCompleted(assignment) {
    setPendingId(assignment.id)
    setLoadError("")
    try {
      await updateSubjectItem(
        assignment.subjectId,
        "assignments",
        assignment.id,
        { completed: !assignment.completed },
      )
      setSubjects((current) =>
        current.map((subject) =>
          getId(subject) === assignment.subjectId
            ? {
                ...subject,
                assignments: subject.assignments.map((item) =>
                  getId(item) === assignment.id
                    ? { ...item, completed: !assignment.completed }
                    : item,
                ),
              }
            : subject,
        ),
      )
    } catch (error) {
      setLoadError(error.message || "Unable to update assignment status.")
    } finally {
      setPendingId("")
    }
  }

  async function removeAssignment(assignment) {
    if (!window.confirm(`Delete "${assignment.title}"?`)) return
    setPendingId(assignment.id)
    setLoadError("")
    try {
      await deleteSubjectItem(
        assignment.subjectId,
        "assignments",
        assignment.id,
      )
      setSubjects((current) =>
        current.map((subject) =>
          getId(subject) === assignment.subjectId
            ? {
                ...subject,
                assignments: subject.assignments.filter(
                  (item) => getId(item) !== assignment.id,
                ),
              }
            : subject,
        ),
      )
    } catch (error) {
      setLoadError(error.message || "Unable to delete this assignment.")
    } finally {
      setPendingId("")
    }
  }

  const pendingCount = assignments.filter((assignment) => !assignment.completed).length

  return (
    <section className="assignments-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">STAY ON TOP OF YOUR WORK</p>
          <h2>Assignments</h2>
          <p className="page-description">
            Track due dates and completion across all your subjects.
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={openCreateForm}
          disabled={subjects.length === 0}
        >
          <Plus size={18} aria-hidden="true" />
          Add assignment
        </button>
      </div>

      {loadError && (
        <div className="inline-alert" role="alert">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setLoadError("")
              getSubjects()
                .then((data) => setSubjects(Array.isArray(data) ? data : []))
                .catch((error) => setLoadError(error.message || "Unable to load assignments."))
                .finally(() => setLoading(false))
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="assignment-empty-state" role="status">Loading assignments…</div>
      ) : subjects.length === 0 ? (
        <div className="assignment-empty-state">
          <h3>Add a subject first</h3>
          <p>Assignments are connected to a subject in your study planner.</p>
          <Link className="primary-button" to="/subjects">
            Open subjects
          </Link>
        </div>
      ) : (
        <>
          <div className="assignment-toolbar">
            <div className="assignment-filters" aria-label="Filter assignments">
              {[
                ["all", "All", assignments.length],
                ["pending", "To do", pendingCount],
                ["completed", "Completed", assignments.length - pendingCount],
              ].map(([value, label, count]) => (
                <button
                  className={`assignment-filter ${filter === value ? "active" : ""}`}
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}<span>{count}</span>
                </button>
              ))}
            </div>
            <label className="assignment-search-label">
              <span className="visually-hidden">Search assignments</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assignments"
              />
            </label>
          </div>

          {visibleAssignments.length === 0 ? (
            <div className="assignment-empty-state">
              <h3>{assignments.length === 0 ? "No assignments yet" : "No matching assignments"}</h3>
              <p>
                {assignments.length === 0
                  ? "Add an assignment to start keeping track of your deadlines."
                  : "Try another search or choose a different filter."}
              </p>
              {assignments.length === 0 && (
                <button className="primary-button" type="button" onClick={openCreateForm}>
                  <Plus size={17} aria-hidden="true" />
                  Add assignment
                </button>
              )}
            </div>
          ) : (
            <div className="assignment-list">
              {visibleAssignments.map((assignment) => (
                <article
                  className={`assignment-row ${assignment.completed ? "completed" : ""}`}
                  key={`${assignment.subjectId}-${assignment.id}`}
                >
                  <button
                    className={`assignment-complete ${assignment.completed ? "is-complete" : ""}`}
                    type="button"
                    aria-label={`${assignment.completed ? "Mark incomplete" : "Mark complete"}: ${assignment.title}`}
                    disabled={pendingId === assignment.id}
                    onClick={() => toggleCompleted(assignment)}
                  >
                    {assignment.completed
                      ? <Check size={16} aria-hidden="true" />
                      : <Circle size={18} aria-hidden="true" />}
                  </button>
                  <div className="assignment-main">
                    <div className="assignment-title-line">
                      <h3>{assignment.title}</h3>
                      <span className={`priority-badge priority-${assignment.priority || "medium"}`}>
                        {assignment.priority || "medium"}
                      </span>
                    </div>
                    {assignment.description && (
                      <p className="assignment-description">{assignment.description}</p>
                    )}
                    <div className="assignment-meta">
                      <span className="subject-tag">
                        <span style={{ backgroundColor: assignment.subjectColor }} />
                        {assignment.subjectName}
                      </span>
                      <span className={isOverdue(assignment) ? "due-date overdue" : "due-date"}>
                        <CalendarDays size={14} aria-hidden="true" />
                        {formatDueDate(assignment.dueDate)}
                        {isOverdue(assignment) && <strong>Overdue</strong>}
                      </span>
                    </div>
                  </div>
                  <div className="assignment-actions">
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Edit ${assignment.title}`}
                      disabled={pendingId === assignment.id}
                      onClick={() => openEditForm(assignment)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      aria-label={`Delete ${assignment.title}`}
                      disabled={pendingId === assignment.id}
                      onClick={() => removeAssignment(assignment)}
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
            className="assignment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="section-eyebrow">ASSIGNMENT DETAILS</p>
                <h2 id="assignment-form-title">
                  {editing ? "Edit assignment" : "Add an assignment"}
                </h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close form"
                disabled={saving}
                onClick={closeForm}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="assignment-subject">Subject</label>
              <select
                id="assignment-subject"
                name="subjectId"
                value={form.subjectId}
                onChange={updateForm}
                required
              >
                <option value="" disabled>Select a subject</option>
                {subjects.map((subject) => (
                  <option key={getId(subject)} value={getId(subject)}>
                    {subject.name}
                  </option>
                ))}
              </select>

              <label className="field-label" htmlFor="assignment-title">Title</label>
              <input
                id="assignment-title"
                name="title"
                type="text"
                value={form.title}
                onChange={updateForm}
                maxLength={120}
                placeholder="e.g. Chapter 4 problem set"
                required
              />

              <label className="field-label" htmlFor="assignment-description">
                Description <span>Optional</span>
              </label>
              <textarea
                id="assignment-description"
                name="description"
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={updateForm}
                placeholder="Add instructions or notes"
              />

              <div className="assignment-form-row">
                <div>
                  <label className="field-label" htmlFor="assignment-due-date">
                    Due date <span>Optional</span>
                  </label>
                  <input
                    id="assignment-due-date"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={updateForm}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="assignment-priority">Priority</label>
                  <select
                    id="assignment-priority"
                    name="priority"
                    value={form.priority}
                    onChange={updateForm}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority[0].toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save changes" : "Create assignment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
