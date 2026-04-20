import React from 'react'
import { NumInput, SectionCard, SectionTitle, ErrorMsg } from './FormParts'

export default function SectionThree({ values, onChange, error }) {
  const fields = [
    { key: 's3_not_reply',      label: 'ไม่ตอบ' },
    { key: 's3_following',      label: 'ติดตาม' },
    { key: 's3_coupon',         label: 'ส่งคูปอง' },
    { key: 's3_dead_chat',      label: 'Chat เสีย' },
    { key: 's3_not_interested', label: 'ไม่สนใจ' },
    { key: 's3_not_registered', label: 'ไม่ได้ลงทะเบียน' },
  ]

  return (
    <SectionCard>
      <SectionTitle icon="💬" title="S3 · Chat ใหม่" />
      <NumInput label="Chat In" value={values.s3_chat_in} onChange={v => onChange('s3_chat_in', v)} />
      {fields.map(f => (
        <NumInput key={f.key} label={f.label} value={values[f.key]} onChange={v => onChange(f.key, v)} />
      ))}
      {error && <ErrorMsg msg={error} />}
    </SectionCard>
  )
}
