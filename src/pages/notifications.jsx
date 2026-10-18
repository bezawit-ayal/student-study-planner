import { useEffect, useMemo, useState } from "react"
import { Bell, Check, CheckCheck, ClipboardCheck, GraduationCap, Trash2, X } from "lucide-react"
import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from "../services/studyflowservice"
import "./workspace-pages.css"

const notificationTypes = [
  { value: "assignment", label: "Assignment", Icon: ClipboardCheck },
  { value: "exam", label: "Exam", Icon: GraduationCap },
  { value: "study", label: "Study plan", Icon: Bell },
  { value: "focus", label: "Focus session", Icon: Bell },
  { value: "general", label: "General", Icon: Bell },
]

function getId(notification) {
  return notification?._id || notification?.id
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ title: "", message: "", type: "general" })
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const [pendingId, setPendingId] = useState("")

  async function loadNotifications(signal) {
    setLoading(true)
    setError("")
    try {
      const result = await getNotifications(signal ? { signal } : undefined)
      setNotifications(Array.isArray(result) ? result : [])
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError(loadError.message || "Unable to load notifications.")
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    getNotifications({ signal: controller.signal })
      .then((result) => setNotifications(Array.isArray(result) ? result : []))
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(loadError.message || "Unable to load notifications.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) =>
      filter === "all" || (filter === "unread" ? !notification.read : notification.read),
    ),
    [filter, notifications],
  )
  const unread = notifications.filter((notification) => !notification.read)

  async function handleCreate(event) {
    event.preventDefault()
    const title = form.title.trim()
    const message = form.message.trim()
    if (!title || !message) {
      setFormError("Add a title and a message.")
      return
    }
    setSaving(true)
    setFormError("")
    try {
      const created = await createNotification({ ...form, title, message })
      setNotifications((current) => [created, ...current])
      setForm({ title: "", message: "", type: "general" })
      setFormOpen(false)
    } catch (saveError) {
      setFormError(saveError.message || "Unable to save this reminder.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleRead(notification) {
    setPendingId(getId(notification))
    setError("")
    try {
      const updated = await updateNotification(getId(notification), { read: !notification.read })
      setNotifications((current) => current.map((item) =>
        getId(item) === getId(notification) ? updated : item,
      ))
    } catch (updateError) {
      setError(updateError.message || "Unable to update this notification.")
    } finally {
      setPendingId("")
    }
  }

  async function removeNotification(notification) {
    setPendingId(getId(notification))
    setError("")
    try {
      await deleteNotification(getId(notification))
      setNotifications((current) => current.filter((item) => getId(item) !== getId(notification)))
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this notification.")
    } finally {
      setPendingId("")
    }
  }

  async function markAllRead() {
    setError("")
    const results = await Promise.allSettled(
      unread.map((notification) => updateNotification(getId(notification), { read: true })),
    )
    const updates = new Map()
    results.forEach((result) => {
      if (result.status === "fulfilled") updates.set(getId(result.value), result.value)
    })
    setNotifications((current) => current.map((notification) =>
      updates.get(getId(notification)) || notification,
    ))
    const failed = results.find((result) => result.status === "rejected")
    if (failed) setError(failed.reason.message || "Some reminders could not be marked as read.")
  }

  return (
    <section className="notifications-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">A QUIETER INBOX</p>
          <h2>Notifications</h2>
          <p className="page-description">
            {unread.length ? `${unread.length} unread ${unread.length === 1 ? "reminder" : "reminders"} to review.` : "Your saved reminders, all in one place."}
          </p>
        </div>
        <button className="primary-button" type="button" onClick={() => { setFormError(""); setFormOpen(true) }}>Add reminder</button>
      </div>

      {error && (
        <div className="inline-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => loadNotifications()}>Retry</button>
        </div>
      )}

      <div className="notification-toolbar">
        <div className="notification-filters" aria-label="Filter notifications">
          {[
            ["all", "All", notifications.length],
            ["unread", "Unread", unread.length],
            ["read", "Read", notifications.length - unread.length],
          ].map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "active" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        {unread.length > 0 && (
          <button className="notification-mark-all" type="button" onClick={markAllRead}>
            <CheckCheck size={16} aria-hidden="true" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="workspace-loading" role="status">Loading reminders…</div>
      ) : visibleNotifications.length === 0 ? (
        <div className="workspace-empty">
          <Bell size={23} strokeWidth={1.6} aria-hidden="true" />
          <h3>{notifications.length ? "Nothing in this view" : "A little room to breathe"}</h3>
          <p>{notifications.length ? "Choose a different filter to see more reminders." : "Reminders you add will be kept here for you."}</p>
        </div>
      ) : (
        <ul className="notification-list">
          {visibleNotifications.map((notification) => {
            const type = notificationTypes.find((item) => item.value === notification.type) || notificationTypes[4]
            const Icon = type.Icon
            return (
              <li className={`notification-row ${notification.read ? "is-read" : ""}`} key={getId(notification)}>
                <span className="notification-type-icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <div className="notification-copy">
                  <div className="notification-title-line">
                    <h3>{notification.title}</h3>
                    {!notification.read && <span className="notification-unread-dot" aria-label="Unread" />}
                  </div>
                  <p>{notification.message}</p>
                  <span className="notification-meta">
                    {type.label}
                    {notification.createdAt && ` · ${new Date(notification.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
                  </span>
                </div>
                <div className="notification-actions">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={notification.read ? `Mark ${notification.title} unread` : `Mark ${notification.title} read`}
                    disabled={pendingId === getId(notification)}
                    onClick={() => toggleRead(notification)}
                  >
                    {notification.read ? <Bell size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                  </button>
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label={`Delete ${notification.title}`}
                    disabled={pendingId === getId(notification)}
                    onClick={() => removeNotification(notification)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {formOpen && (
        <div className="modal-backdrop" onMouseDown={() => !saving && setFormOpen(false)}>
          <section
            className="activity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div><p className="section-eyebrow">A NOTE FOR LATER</p><h2 id="notification-form-title">Add reminder</h2></div>
              <button className="icon-button" type="button" aria-label="Close form" disabled={saving} onClick={() => setFormOpen(false)}>
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <label className="field-label" htmlFor="notification-title">Title</label>
              <input id="notification-title" maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required autoFocus />
              <label className="field-label" htmlFor="notification-message">Message</label>
              <textarea id="notification-message" rows={4} maxLength={1000} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} required />
              <label className="field-label" htmlFor="notification-type">Reminder type</label>
              <select id="notification-type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                {notificationTypes.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions">
                <button className="secondary-button" type="button" disabled={saving} onClick={() => setFormOpen(false)}>Cancel</button>
                <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save reminder"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
