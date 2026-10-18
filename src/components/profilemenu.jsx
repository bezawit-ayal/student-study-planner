import { useEffect, useRef, useState } from "react"
import { ChevronDown, Settings, UserRound } from "lucide-react"

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem("studyflow-profile") || "null")
  } catch {
    return null
  }
}

export default function ProfileMenu({ onNavigate }) {
  const [profile, setProfile] = useState(readProfile)
  const menuRef = useRef(null)

  useEffect(() => {
    function updateProfile() {
      setProfile(readProfile())
    }
    function closeOnEscape(event) {
      if (event.key === "Escape" && menuRef.current?.open) {
        menuRef.current.open = false
        menuRef.current.querySelector("summary")?.focus()
      }
    }
    function closeOnOutsidePointer(event) {
      if (menuRef.current?.open && !menuRef.current.contains(event.target)) {
        menuRef.current.open = false
      }
    }
    window.addEventListener("studyflow:profile-updated", updateProfile)
    window.addEventListener("storage", updateProfile)
    window.addEventListener("keydown", closeOnEscape)
    document.addEventListener("pointerdown", closeOnOutsidePointer)
    return () => {
      window.removeEventListener("studyflow:profile-updated", updateProfile)
      window.removeEventListener("storage", updateProfile)
      window.removeEventListener("keydown", closeOnEscape)
      document.removeEventListener("pointerdown", closeOnOutsidePointer)
    }
  }, [])

  function navigateTo(page) {
    if (menuRef.current) menuRef.current.open = false
    onNavigate(page)
  }

  const initials = profile?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase())
    .join("") || "S"

  return (
    <details className="profile-menu" ref={menuRef}>
      <summary className="profile-trigger" aria-label="Open profile menu">
        {profile?.profilePhoto ? (
          <img className="profile-avatar profile-photo-avatar" src={profile.profilePhoto} alt="" />
        ) : (
          <span className="profile-avatar" aria-hidden="true">{initials}</span>
        )}
        <span className="profile-trigger-info">
          <strong>{profile?.name || "Set up your profile"}</strong>
          <small>{profile?.email || "Profile & preferences"}</small>
        </span>
        <ChevronDown className="profile-chevron" size={16} aria-hidden="true" />
      </summary>
      <div className="profile-dropdown">
        <button type="button" onClick={() => navigateTo("settings")}>
          <UserRound size={16} aria-hidden="true" />
          Profile
        </button>
        <button type="button" onClick={() => navigateTo("settings")}>
          <Settings size={16} aria-hidden="true" />
          Settings
        </button>
      </div>
    </details>
  )
}