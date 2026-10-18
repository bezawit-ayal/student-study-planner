import { useContext } from "react"
import { FocusTimerContext } from "./focusTimerContext"

export default function useFocusTimer() {
  const context = useContext(FocusTimerContext)
  if (!context) {
    throw new Error("useFocusTimer must be used inside FocusTimerProvider.")
  }
  return context
}
