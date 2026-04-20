import React from 'react'

export function SectionCard({ children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 16,
      marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    }}>
      {children}
    </div>
  )
}

export function SectionTitle({ icon, title }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#1a1a1a' }}>
      {icon} {title}
    </div>
  )
}

export function NumInput({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <label style={{ fontSize: 14, color: '#444', flex: 1 }}>{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: 72, textAlign: 'center', padding: '6px 4px',
          border: '1.5px solid #ddd', borderRadius: 8, fontSize: 15,
          fontWeight: 600,
        }}
      />
    </div>
  )
}

export function ReadonlyRow({ label, value, hint }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: '#888' }}>{label}</span>
        <span style={{
          width: 72, textAlign: 'center', padding: '6px 4px',
          background: '#F5F5F5', border: '1.5px solid #e0e0e0',
          borderRadius: 8, fontSize: 15, fontWeight: 700, color: '#1976D2',
        }}>
          {value}
        </span>
      </div>
      {hint && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>💡 {hint}</div>}
    </div>
  )
}

export function ErrorMsg({ msg }) {
  return (
    <div style={{
      marginTop: 8, padding: '6px 10px',
      background: '#FFEBEE', borderRadius: 6,
      color: '#C62828', fontSize: 13,
    }}>
      ❌ {msg}
    </div>
  )
}
