import { useEffect, useState } from "react"
import { BookOpen, Pencil, Plus, Trash2, X } from "lucide-react"
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../services/studyflowservice"
import "./subjectspage.css"

const defaultColors = ["#174d36", "#d4a843", "#397653", "#103b2b", "#f0d58a"]

function getSubjectId(subject) {
  return subject._id || subject.id
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(defaultColors[0])
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState("")

  function retryLoad() {
    setLoading(true)
    setError("")
    getSubjects()
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch((loadError) => {
        setError(loadError.message || "Unable to load subjects.")
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const controller = new AbortController()
    getSubjects({ signal: controller.signal })
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(loadError.message || "Unable to load subjects.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [])

  function openCreateForm() {
    setEditingSubject(null)
    setName("")
    setDescription("")
    setColor(defaultColors[0])
    setFormError("")
    setIsFormOpen(true)
  }

  function openEditForm(subject) {
    setEditingSubject(subject)
    setName(subject.name || "")
    setDescription(subject.description || "")
    setColor(subject.color || defaultColors[0])
    setFormError("")
    setIsFormOpen(true)
  }

  function closeForm() {
    if (!saving) {
      setIsFormOpen(false)
      setEditingSubject(null)
      setFormError("")
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setFormError("Enter a subject name.")
      return
    }

    setSaving(true)
    setFormError("")
    const payload = {
      name: trimmedName,
      description: description.trim(),
      color,
    }

    try {
      if (editingSubject) {
        const savedSubject = await updateSubject(
          getSubjectId(editingSubject),
          payload,
        )
        setSubjects((current) =>
          current.map((subject) =>
            getSubjectId(subject) === getSubjectId(editingSubject)
              ? savedSubject
              : subject,
          ),
        )
      } else {
        const savedSubject = await createSubject(payload)
        setSubjects((current) => [savedSubject, ...current])
      }
      setIsFormOpen(false)
      setEditingSubject(null)
    } catch (saveError) {
      setFormError(saveError.message || "Unable to save this subject.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(subject) {
    const subjectId = getSubjectId(subject)
    if (!window.confirm(`Delete "${subject.name}" and its related activities?`)) {
      return
    }

    setDeletingId(subjectId)
    setError("")
    try {
      await deleteSubject(subjectId)
      setSubjects((current) =>
        current.filter((item) => getSubjectId(item) !== subjectId),
      )
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this subject.")
    } finally {
      setDeletingId("")
    }
  }

  return (
    <section className="subjects-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">YOUR COURSEWORK</p>
          <h2>Subjects</h2>
          <p className="page-description">
            Keep each class and its academic activities organized in one place.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={openCreateForm}>
          <Plus size={18} aria-hidden="true" />
          Add subject
        </button>
      </div>

      {error && (
        <div className="inline-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={retryLoad}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="subjects-state" role="status">Loading your subjects…</div>
      ) : subjects.length === 0 ? (
        <div className="subjects-empty">
          <span className="empty-icon"><BookOpen size={24} /></span>
          <h3>No subjects yet</h3>
          <p>Add your first subject to start organizing your coursework.</p>
          <button className="primary-button" type="button" onClick={openCreateForm}>
            <Plus size={18} aria-hidden="true" />
            Add your first subject
          </button>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject, index) => {
            const assignmentCount = subject.assignments?.length || 0
            const examCount = subject.exams?.length || 0
            const sessionCount = subject.studySessions?.length || 0

            return (
              <article className="subject-card" key={getSubjectId(subject)}>
                <div
                  className="subject-card-accent"
                  style={{ backgroundColor: subject.color || defaultColors[index % defaultColors.length] }}
                />
                <div className="subject-card-top">
                  <span
                    className="subject-card-icon"
                    style={{ color: subject.color || defaultColors[index % defaultColors.length] }}
                  >
                    <BookOpen size={19} aria-hidden="true" />
                  </span>
                  <div className="subject-actions">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Edit ${subject.name}`}
                      onClick={() => openEditForm(subject)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      aria-label={`Delete ${subject.name}`}
                      disabled={deletingId === getSubjectId(subject)}
                      onClick={() => handleDelete(subject)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <h3>{subject.name}</h3>
                <p className="subject-description">
                  {subject.description || "No description added."}
                </p>
                <div className="subject-card-footer">
                  <span>{assignmentCount} assignments</span>
                  <span>{examCount} exams</span>
                  <span>{sessionCount} study sessions</span>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {isFormOpen && (
        <div className="modal-backdrop" onMouseDown={closeForm}>
          <section
            className="subject-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="section-eyebrow">SUBJECT DETAILS</p>
                <h2 id="subject-form-title">
                  {editingSubject ? "Edit subject" : "Add a subject"}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close form"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="subject-name">Subject name</label>
              <input
                id="subject-name"
                name="name"
                type="text"
                autoFocus
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Biology"
                required
              />

              <label className="field-label" htmlFor="subject-description">
                Description <span>Optional</span>
              </label>
              <textarea
                id="subject-description"
                name="description"
                rows={3}
                maxLength={500}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a note about this class"
              />

              <fieldset className="color-field">
                <legend className="field-label">Subject color</legend>
                <div className="color-options">
                  {defaultColors.map((option) => (
                    <label className="color-option" key={option}>
                      <input
                        type="radio"
                        name="subject-color"
                        value={option}
                        checked={color === option}
                        onChange={() => setColor(option)}
                      />
                      <span style={{ backgroundColor: option }} />
                      <span className="visually-hidden">{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

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
                  {saving ? "Saving…" : editingSubject ? "Save changes" : "Create subject"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
