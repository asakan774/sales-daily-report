import React, { createContext, useContext, useState } from 'react'

const ALL_PROJECTS = ['elysium', 'wela', 'celine']
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('line_auth') ?? 'null') }
    catch { return null }
  })

  function setUser(userData) {
    localStorage.setItem('line_auth', JSON.stringify(userData))
    setAuthState(userData)
  }

  function logout() {
    localStorage.removeItem('line_auth')
    setAuthState(null)
  }

  const isLoggedIn = !!auth
  const isAdmin = auth?.projectIds?.includes('admin') ?? false
  const allowedProjects = isAdmin
    ? ALL_PROJECTS
    : (auth?.projectIds ?? []).filter(p => ALL_PROJECTS.includes(p))

  return (
    <AuthContext.Provider value={{ auth, isLoggedIn, isAdmin, allowedProjects, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
