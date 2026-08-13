import { useEffect, useState } from 'react'

/** Mock online count — drifts slowly so it feels alive. */
export function usePresence() {
  const [count, setCount] = useState(() => 18 + Math.floor(Math.random() * 12))

  useEffect(() => {
    const tick = () => {
      setCount((c) => {
        const next = c + (Math.random() > 0.5 ? 1 : -1)
        return Math.min(48, Math.max(12, next))
      })
    }
    const id = window.setInterval(tick, 8_000 + Math.random() * 7_000)
    return () => window.clearInterval(id)
  }, [])

  return count
}
