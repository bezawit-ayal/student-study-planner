import { useCallback, useEffect, useState } from "react"
import { getSubjects } from "../services/studyflowservice"

export default function useSubjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadSubjects = useCallback(async (signal) => {
    setLoading(true)
    setError("")
    try {
      const result = await getSubjects({ signal })
      setSubjects(Array.isArray(result) ? result : [])
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError(loadError.message || "Unable to load subjects.")
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getSubjects({ signal: controller.signal })
      .then((result) => setSubjects(Array.isArray(result) ? result : []))
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(loadError.message || "Unable to load subjects.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return { subjects, setSubjects, loading, error, reload: () => loadSubjects() }
}
