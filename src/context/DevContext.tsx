'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface DevContextValue {
  isDevMode: boolean
  loading: boolean
  login: (key: string) => Promise<boolean>
  logout: () => void
}

const DevContext = createContext<DevContextValue>({
  isDevMode: false,
  loading: true,
  login: async () => false,
  logout: () => {},
})

const COOKIE_NAME = 'dev_session'
const SESSION_SECONDS = 1800 // 30 min

function readDevCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE_NAME}=1`))
}

export function setDevCookie() {
  document.cookie = `${COOKIE_NAME}=1; max-age=${SESSION_SECONDS}; SameSite=Lax; path=/`
}

function clearDevCookie() {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`
}

export function DevProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsDevMode(readDevCookie())
    setLoading(false)
  }, [])

  // Refresh cookie on any user activity while in dev mode
  useEffect(() => {
    if (!isDevMode) return
    const refresh = () => {
      if (readDevCookie()) setDevCookie()
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll'] as const
    events.forEach(e => window.addEventListener(e, refresh, { passive: true }))
    return () => events.forEach(e => window.removeEventListener(e, refresh))
  }, [isDevMode])

  const login = useCallback(async (key: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      const data = await res.json()
      if (data.ok) {
        setDevCookie()
        setIsDevMode(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    clearDevCookie()
    // Also clear legacy api_docs_access cookie
    document.cookie = 'api_docs_access=; max-age=0; path=/'
    setIsDevMode(false)
  }, [])

  return (
    <DevContext.Provider value={{ isDevMode, loading, login, logout }}>
      {children}
    </DevContext.Provider>
  )
}

export function useDevMode() {
  return useContext(DevContext)
}
