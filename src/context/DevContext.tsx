'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface DevContextValue {
  isDevMode: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const DevContext = createContext<DevContextValue>({
  isDevMode: false,
  loading: true,
  login: async () => false,
  logout: async () => {},
})

export function DevProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check auth state on mount by calling the status endpoint
  useEffect(() => {
    fetch('/api/admin/status')
      .then(r => r.json())
      .then((data: { authenticated: boolean }) => {
        setIsDevMode(data.authenticated === true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        setIsDevMode(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    setIsDevMode(false)
    // Redirect to admin login
    window.location.href = '/admin'
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
