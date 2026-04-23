import React from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import DailyView from './pages/DailyView'
import MonthlyView from './pages/MonthlyView'
import SalesDetail from './pages/SalesDetail'
import AdminSales from './pages/AdminSales'
import LoginPage from './pages/LoginPage'
import CallbackPage from './pages/CallbackPage'
import { useAuth } from './contexts/AuthContext'

function AuthGuard({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function AdminGuard({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/" replace />
}

const navStyle = {
  display: 'flex', gap: 0, background: '#fff',
  borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 10,
  alignItems: 'center',
}
const linkStyle = { padding: '14px 20px', fontSize: 14, color: '#666', textDecoration: 'none' }
const activeLinkStyle = { ...linkStyle, color: '#1B5E20', borderBottom: '2px solid #1B5E20', fontWeight: 700 }

function Nav() {
  const { auth, isAdmin, logout } = useAuth()
  return (
    <nav style={navStyle}>
      <NavLink to="/"        style={({ isActive }) => isActive ? activeLinkStyle : linkStyle} end>📅 รายวัน</NavLink>
      <NavLink to="/monthly" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>📈 รายเดือน</NavLink>
      {isAdmin && (
        <NavLink to="/admin/sales" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>⚙️ Admin</NavLink>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
        <span style={{ fontSize: 12, color: '#888' }}>{auth?.displayName}</span>
        <button onClick={logout} style={{
          fontSize: 12, padding: '4px 10px', borderRadius: 6,
          border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#666',
        }}>ออกจากระบบ</button>
      </div>
    </nav>
  )
}

export default function App() {
  const { isLoggedIn } = useAuth()

  return (
    <>
      {isLoggedIn && <Nav />}
      <Routes>
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/callback"     element={<CallbackPage />} />
        <Route path="/"             element={<AuthGuard><DailyView /></AuthGuard>} />
        <Route path="/monthly"      element={<AuthGuard><MonthlyView /></AuthGuard>} />
        <Route path="/sales/:id"    element={<AuthGuard><SalesDetail /></AuthGuard>} />
        <Route path="/admin/sales"  element={<AuthGuard><AdminGuard><AdminSales /></AdminGuard></AuthGuard>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
