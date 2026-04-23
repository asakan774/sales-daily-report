import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PROJECTS = ['elysium', 'wela', 'celine']
const PROJECT_NAMES = { elysium: 'Asakan Elysium', wela: 'Wela', celine: 'Celine' }

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1.5px solid #ddd', fontSize: 14, marginBottom: 10,
}
const btnPrimary = {
  width: '100%', padding: '11px 0', borderRadius: 8,
  background: '#1B5E20', color: '#fff', border: 'none',
  fontSize: 14, fontWeight: 700, cursor: 'pointer',
}
const btnSecondary = {
  width: '100%', padding: '11px 0', borderRadius: 8,
  background: '#f5f5f5', color: '#555', border: 'none',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 6,
}

function FormContent({ form, setForm, editTarget, saving, onSave, onCancel }) {
  return (
    <>
      <input
        placeholder="LINE User ID (U...)"
        value={form.line_id}
        onChange={e => setForm(f => ({ ...f, line_id: e.target.value }))}
        disabled={!!editTarget}
        style={{ ...inputStyle, background: editTarget ? '#f5f5f5' : '#fff' }}
      />
      <input
        placeholder="ชื่อ Sales"
        value={form.display_name}
        onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
        style={inputStyle}
      />
      <select
        value={form.project_id}
        onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
        style={inputStyle}
      >
        {PROJECTS.map(p => <option key={p} value={p}>{PROJECT_NAMES[p]}</option>)}
      </select>
      <button onClick={onSave} disabled={saving} style={btnPrimary}>
        {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
      </button>
      <button onClick={onCancel} style={btnSecondary}>ยกเลิก</button>
    </>
  )
}

export default function AdminSales() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sales, setSales] = useState([])
  const [filterProject, setFilterProject] = useState('all')
  const [filterActive, setFilterActive] = useState('all')
  const [loading, setLoading] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ line_id: '', display_name: '', project_id: 'elysium' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchSales() }, [])

  async function fetchSales() {
    setLoading(true)
    const { data } = await supabase
      .from('sales')
      .select('*')
      .order('project_id')
      .order('display_name')
    setSales(data ?? [])
    setLoading(false)
  }

  const filtered = sales.filter(s => {
    if (filterProject !== 'all' && s.project_id !== filterProject) return false
    if (filterActive === 'active' && !s.is_active) return false
    if (filterActive === 'inactive' && s.is_active) return false
    return true
  })

  function openAdd() {
    setForm({ line_id: '', display_name: '', project_id: 'elysium' })
    setAddModal(true)
  }

  function openEdit(s) {
    setForm({ line_id: s.line_id, display_name: s.display_name, project_id: s.project_id })
    setEditTarget(s)
  }

  async function handleSave() {
    if (!form.line_id || !form.display_name) return
    setSaving(true)
    if (editTarget) {
      await supabase.from('sales').update({
        display_name: form.display_name,
        project_id: form.project_id,
      }).eq('id', editTarget.id)
    } else {
      await supabase.from('sales').insert({
        line_id: form.line_id,
        display_name: form.display_name,
        project_id: form.project_id,
      })
    }
    setSaving(false)
    setAddModal(false)
    setEditTarget(null)
    fetchSales()
  }

  async function toggleActive(s) {
    await supabase.from('sales').update({ is_active: !s.is_active }).eq('id', s.id)
    fetchSales()
  }

  async function handleDelete(s) {
    if (!window.confirm(`ลบ "${s.display_name}" (${PROJECT_NAMES[s.project_id]}) ออกจากระบบ?`)) return
    await supabase.from('sales').delete().eq('id', s.id)
    fetchSales()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>⚙️ จัดการ Sales</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openAdd} style={{
            padding: '8px 14px', borderRadius: 8, background: '#1B5E20',
            color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>+ เพิ่ม Sales</button>
          <button onClick={() => { logout(); navigate('/') }} style={{
            padding: '8px 14px', borderRadius: 8, background: '#f5f5f5',
            color: '#555', border: 'none', cursor: 'pointer', fontSize: 13,
          }}>ออกจากระบบ</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ ...inputStyle, width: 'auto', marginBottom: 0 }}>
          <option value="all">ทุกโปรเจกต์</option>
          {PROJECTS.map(p => <option key={p} value={p}>{PROJECT_NAMES[p]}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={{ ...inputStyle, width: 'auto', marginBottom: 0 }}>
          <option value="all">ทุกสถานะ</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>⏳ กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => (
            <div key={s.id} style={{
              background: '#fff', borderRadius: 10, padding: '12px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              opacity: s.is_active ? 1 : 0.55,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{s.display_name}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 11, padding: '2px 8px',
                    background: '#E8F5E9', color: '#2E7D32', borderRadius: 20,
                  }}>
                    {PROJECT_NAMES[s.project_id]}
                  </span>
                  {!s.is_active && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#C62828' }}>● ปิดใช้งาน</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(s)} style={{
                    padding: '5px 10px', borderRadius: 6, border: '1px solid #ddd',
                    background: '#fff', fontSize: 12, cursor: 'pointer',
                  }}>แก้ไข</button>
                  <button onClick={() => toggleActive(s)} style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none',
                    background: s.is_active ? '#FFF9C4' : '#E8F5E9',
                    color: s.is_active ? '#F57F17' : '#2E7D32',
                    fontSize: 12, cursor: 'pointer',
                  }}>
                    {s.is_active ? 'ปิด' : 'เปิด'}
                  </button>
                  <button onClick={() => handleDelete(s)} style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none',
                    background: '#FFEBEE', color: '#C62828', fontSize: 12, cursor: 'pointer',
                  }}>ลบ</button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{s.line_id}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>ไม่มีข้อมูล</div>
          )}
        </div>
      )}

      {addModal && (
        <Modal title="+ เพิ่ม Sales" onClose={() => setAddModal(false)}>
          <FormContent form={form} setForm={setForm} editTarget={null} saving={saving}
            onSave={handleSave} onCancel={() => setAddModal(false)} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="✏️ แก้ไข Sales" onClose={() => setEditTarget(null)}>
          <FormContent form={form} setForm={setForm} editTarget={editTarget} saving={saving}
            onSave={handleSave} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}
    </div>
  )
}
