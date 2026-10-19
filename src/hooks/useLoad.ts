import { useEffect, useRef, useState } from 'react'
export function useLoad<T>(key: string, loader: () => Promise<T>) {
  const [state, setState] = useState<{ key: string; data?: T; error?: unknown; loading: boolean }>({ key, loading: true })
  const [attempt, setAttempt] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader
  useEffect(() => {
    let active = true
    setState({ key, loading: true })
    loaderRef.current().then(
      data => { if (active) setState({ key, data, loading: false }) },
      error => { if (active) setState({ key, error, loading: false }) },
    )
    return () => { active = false }
  }, [key, attempt])
  return { ...(state.key === key ? state : { key, loading: true }), retry: () => setAttempt(v => v + 1) }
}
