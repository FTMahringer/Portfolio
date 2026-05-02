'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const READING_ROUTES = ['/blog/', '/experience/']

export function ReadingProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)

  const active = READING_ROUTES.some(r => pathname.startsWith(r))

  useEffect(() => {
    if (!active) { setProgress(0); return }

    function update() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [active, pathname])

  if (!active) return null

  return (
    <div className="fixed top-14 left-0 right-0 h-0.5 z-40 bg-[var(--border)]">
      <div
        className="h-full bg-[var(--accent)] transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
