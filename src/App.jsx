import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import WorkspaceLayout from "./components/workspacelayout"
import { FocusTimerProvider } from "./contexts/focustimerprovider"
import Dashboard from "./pages/dashboard"
import SubjectsPage from "./pages/subjectspage"
import AssignmentsPage from "./pages/assignmentspage"
import SubjectActivityPage from "./pages/activitypage"
import FocusTimerPage from "./pages/focustimer"
import ProgressPage from "./pages/progress"
import NotificationsPage from "./pages/notifications"
import SettingsPage from "./pages/settings"
import WelcomePage from "./pages/welcome"

function App() {
  return (
    <BrowserRouter>
      <FocusTimerProvider>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route element={<WorkspaceLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route
              path="exams"
              element={<SubjectActivityPage resource="exams" />}
            />
            <Route
              path="studyplan"
              element={<SubjectActivityPage resource="study-sessions" />}
            />
            <Route path="focustimer" element={<FocusTimerPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </FocusTimerProvider>
    </BrowserRouter>
  )
}

export default App