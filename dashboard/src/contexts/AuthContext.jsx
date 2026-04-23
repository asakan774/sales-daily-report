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
  const isAdmin = auth?.projectId === 'admin'
  const allowedProjects = isAdmin ? ALL_PROJECTS : auth?.projectId ? [auth.projectId] : []

  return (
    <AuthContext.Provider value={{ auth, isLoggedIn, isAdmin, allowedProjects, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
