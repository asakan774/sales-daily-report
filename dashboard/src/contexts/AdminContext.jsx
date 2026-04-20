import React, { createContext, useContext, useState } from 'react'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') ?? '')

  function login(hash) {
    localStorage.setItem('admin_token', hash)
    setToken(hash)
  }

  function logout() {
    localStorage.removeItem('admin_token')
    setToken('')
  }

  const isAdmin = token === import.meta.env.VITE_ADMIN_PASSWORD_HASH && token !== ''

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
