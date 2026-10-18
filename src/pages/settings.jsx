import { useEffect, useState } from "react"
import { Check, CircleUserRound, Settings2 } from "lucide-react"
import { createProfile, getProfile, updateProfile } from "../services/studyflowservice"
import "./workspace-pages.css"

const profileIdKey = "studyflow-profile-id"
const preferencesKey = "studyflow-preferences"
const profileEvent = "studyflow:profile-updated"

function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(preferencesKey) || "{}")
    return {
      focusDuration: Number.isInteger(saved.focusDuration) ? saved.focusDuration : 25,
    }
  } catch {
    return { focusDuration: 25 }
  }
}

function announceProfile(profile) {
  localStorage.setItem("studyflow-profile", JSON.stringify({
    name: profile.name,
    email: profile.email,
    profilePhoto: profile.profilePhoto || "",
  }))
  window.dispatchEvent(new CustomEvent(profileEvent))
}

export default function SettingsPage() {
  const [profileId, setProfileId] = useState(() => localStorage.getItem(profileIdKey) || "")
  const [profile, setProfile] = useState({ name: "", email: "", profilePhoto: "" })
  const [profileLoading, setProfileLoading] = useState(Boolean(localStorage.getItem(profileIdKey)))
  const [profileError, setProfileError] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [preferences, setPreferences] = useState(readPreferences)
  const [preferencesSaved, setPreferencesSaved] = useState(false)

  useEffect(() => {
    if (!profileId) return undefined
    const controller = new AbortController()
    getProfile(profileId, { signal: controller.signal })
      .then((data) => {
        setProfile({ name: data.name || "", email: data.email || "", profilePhoto: data.profilePhoto || "" })
        announceProfile(data)
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setProfileError(error.message || "Unable to load your saved profile.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileLoading(false)
      })
    return () => controller.abort()
  }, [profileId])

  async function handleSaveProfile(event) {
    event.preventDefault()
    const name = profile.name.trim()
    const email = profile.email.trim().toLowerCase()
    if (!name || !email) {
      setProfileError("Your name and email are required.")
      return
    }
    setProfileSaving(true)
    setProfileError("")
    setProfileSaved(false)
    try {
      const data = profileId
        ? await updateProfile(profileId, { name, email, profilePhoto: profile.profilePhoto.trim() })
        : await createProfile({ name, email, profilePhoto: profile.profilePhoto.trim() })
      if (!profileId) {
        localStorage.setItem(profileIdKey, data._id || data.id)
        setProfileId(data._id || data.id)
      }
      setProfile({ name: data.name, email: data.email, profilePhoto: data.profilePhoto || "" })
      announceProfile(data)
      setProfileSaved(true)
    } catch (error) {
      setProfileError(error.message || "Unable to save your profile.")
    } finally {
      setProfileSaving(false)
    }
  }

  function savePreferences(event) {
    event.preventDefault()
    localStorage.setItem(preferencesKey, JSON.stringify(preferences))
    window.dispatchEvent(new CustomEvent("studyflow:preferences-updated", { detail: preferences }))
    setPreferencesSaved(true)
  }

  function updateProfileField(event) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setProfileSaved(false)
  }

  function updatePreference(event) {
    const { name, value } = event.target
    setPreferences((current) => ({
      ...current,
      [name]: name === "focusDuration" ? Number(value) : value,
    }))
    setPreferencesSaved(false)
  }

  return (
    <section className="settings-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">MAKE IT YOURS</p>
          <h2>Settings</h2>
          <p className="page-description">Manage the profile and study preferences saved with your workspace.</p>
        </div>
      </div>

      <section className="settings-panel">
        <div className="settings-panel-heading">
          <span><CircleUserRound size={19} aria-hidden="true" /></span>
          <div><h3>Profile</h3><p>A basic profile is stored in the StudyFlow database. Sign-in and authentication are not enabled.</p></div>
        </div>
        {profileLoading ? (
          <p className="workspace-loading" role="status">Loading profile…</p>
        ) : (
          <form className="settings-form" onSubmit={handleSaveProfile}>
            <div className="settings-fields">
              <div>
                <label className="field-label" htmlFor="profile-name">Name</label>
                <input id="profile-name" name="name" autoComplete="name" maxLength={100} value={profile.name} onChange={updateProfileField} required />
              </div>
              <div>
                <label className="field-label" htmlFor="profile-email">Email address</label>
                <input id="profile-email" name="email" type="email" autoComplete="email" maxLength={254} value={profile.email} onChange={updateProfileField} required />
              </div>
              <div className="settings-photo-field">
                <label className="field-label" htmlFor="profile-photo">Profile photo URL <span>Optional</span></label>
                <input id="profile-photo" name="profilePhoto" type="url" maxLength={2048} value={profile.profilePhoto} onChange={updateProfileField} placeholder="https://…" />
              </div>
            </div>
            {profileError && <p className="form-error" role="alert">{profileError}</p>}
            <div className="settings-form-footer">
              <span>{profileSaved && <><Check size={15} aria-hidden="true" /> Profile saved</>}</span>
              <button className="primary-button" type="submit" disabled={profileSaving}>
                {profileSaving ? "Saving…" : profileId ? "Save profile" : "Create profile"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="settings-panel">
        <div className="settings-panel-heading">
          <span><Settings2 size={19} aria-hidden="true" /></span>
          <div><h3>Study preferences</h3><p>These preferences are saved in this browser on this device.</p></div>
        </div>
        <form className="settings-form" onSubmit={savePreferences}>
          <div className="settings-fields">
            <div>
              <label className="field-label" htmlFor="focus-duration">Default focus session</label>
              <select id="focus-duration" name="focusDuration" value={preferences.focusDuration} onChange={updatePreference}>
                {[25, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
              </select>
            </div>
          </div>
          <div className="settings-form-footer">
            <span>{preferencesSaved && <><Check size={15} aria-hidden="true" /> Preferences saved</>}</span>
            <button className="secondary-button" type="submit">Save preferences</button>
          </div>
        </form>
      </section>
    </section>
  )
}
