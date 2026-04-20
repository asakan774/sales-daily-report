import React from 'react'
import { NumInput, SectionCard, SectionTitle, ErrorMsg, ReadonlyRow } from './FormParts'

export default function SectionFour({ values, onChange, error }) {
  const fields = [
    { key: 's4_not_reply',      label: 'ไม่ตอบ → S4' },
    { key: 's4_following',      label: 'ติดตาม → S4' },
    { key: 's4_coupon',         label: 'ส่งคูปอง' },
    { key: 's4_not_interested', label: 'ไม่สนใจ' },
    { key: 's4_dead_chat',      label: 'Chat เสีย' },
  ]

  return (
    <SectionCard>
      <SectionTitle icon="📱" title="S4 · Follow Chat" />
      <ReadonlyRow
        label="Carryover 🔒"
        value={values.s4_carryover}
        hint="ติดตาม + ยังไม่ตอบ จาก S3 และ S4 เมื่อวาน"
      />
      <ReadonlyRow
        label="Chat กลับมา ✏️🔒"
        value={values.s4_old_chat_back}
        hint="Chat เก่าที่กลับมา (กรอกอัตโนมัติ)"
      />
      {fields.map(f => (
        <NumInput key={f.key} label={f.label + ' ✏️'} value={values[f.key]} onChange={v => onChange(f.key, v)} />
      ))}
      {error && <ErrorMsg msg={error} />}
    </SectionCard>
  )
}
