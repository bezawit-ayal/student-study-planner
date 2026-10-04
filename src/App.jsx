import { BrowserRouter, Route, Routes } from "react-router-dom"

import Welcome from "./pages/welcome"
import SignUp from "./pages/sign-up"
import SignIn from "./pages/sign-in"
import Onboarding from "./pages/onboarding"
import Dashboard from "./pages/dashboard"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Welcome />}
        />

        <Route
          path="/sign-up"
          element={<SignUp />}
        />

        <Route
          path="/sign-in"
          element={<SignIn />}
        />

        <Route
          path="/onboarding"
          element={<Onboarding />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App