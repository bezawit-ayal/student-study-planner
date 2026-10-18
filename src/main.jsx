import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App.jsx"
import "./index.css"
import "./pages/styles/global.css"
import "./pages/styles/layout.css"
import "./pages/workspace-pages.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)