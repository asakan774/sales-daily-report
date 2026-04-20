import React from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import DailyView from './pages/DailyView'
import MonthlyView from './pages/MonthlyView'
import SalesDetail from './pages/SalesDetail'
import AdminLogin from './pages/AdminLogin'
import AdminSales from './pages/AdminSales'
import { useAdmin } from './contexts/AdminContext'

function AdminGuard({ children }) {
  const { isAdmin } = useAdmin()
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}

const navStyle = {
  display: 'flex', gap: 0, background: '#fff',
  borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 10,
}
const linkStyle = { padding: '14px 20px', fontSize: 14, color: '#666' }
const activeLinkStyle = { ...linkStyle, color: '#1B5E20', borderBottom: '2px solid #1B5E20', fontWeight: 700 }

export default function App() {
  return (
    <>
      <nav style={navStyle}>
        <NavLink to="/"        style={({ isActive }) => isActive ? activeLinkStyle : linkStyle} end>📅 รายวัน</NavLink>
        <NavLink to="/monthly" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>📈 รายเดือน</NavLink>
        <NavLink to="/admin/sales" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>⚙️ Admin</NavLink>
      </nav>
      <Routes>
        <Route path="/"             element={<DailyView />} />
        <Route path="/monthly"      element={<MonthlyView />} />
        <Route path="/sales/:id"    element={<SalesDetail />} />
        <Route path="/admin/login"  element={<AdminLogin />} />
        <Route path="/admin/sales"  element={<AdminGuard><AdminSales /></AdminGuard>} />
      </Routes>
    </>
  )
}
