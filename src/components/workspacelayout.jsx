import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Sprout, Timer } from "lucide-react"
import ProfileMenu from "./profilemenu"
import Sidebar from "./sidebar"
import useFocusTimer from "../contexts/useFocusTimer"

const knownPages = [
  "dashboard",
  "subjects",
  "assignments",
  "exams",
  "studyplan",
  "focustimer",
  "progress",
  "notifications",
  "settings",
]

export default function WorkspaceLayout() {
  const { remaining, running } = useFocusTimer()
  const location = useLocation()
  const navigate = useNavigate()
  const activePage = location.pathname.split("/")[1] || "dashboard"
  const currentPage = knownPages.includes(activePage) ? activePage : "dashboard"
  const pageLabel = currentPage === "studyplan"
    ? "Study Plan"
    : currentPage === "focustimer"
      ? "Focus Timer"
      : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
  const timerLabel = `${Math.floor(remaining / 60).toString().padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`

  return (
    <div className="app-layout">
      <Sidebar
        activePage={currentPage}
        onNavigate={(page) => navigate(`/${page}`)}
      />
      <main className="main-workspace">
        <header className="workspace-header">
          <div className="workspace-header-brand">
            <Sprout size={19} strokeWidth={1.8} aria-hidden="true" />
            <span>STUDYFLOW</span>
          </div>
          <div className="workspace-header-actions">
            <span className="workspace-current-page">{pageLabel}</span>
            <span className="workspace-header-note">Small steps, steady progress.</span>
            {running && (
              <button
                className="workspace-timer-indicator"
                type="button"
                onClick={() => navigate("/focustimer")}
                aria-label={`Focus session in progress, ${timerLabel} remaining. Open timer.`}
              >
                <Timer size={15} aria-hidden="true" />
                <span aria-hidden="true">{timerLabel}</span>
              </button>
            )}
            <ProfileMenu onNavigate={(page) => navigate(`/${page}`)} />
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
