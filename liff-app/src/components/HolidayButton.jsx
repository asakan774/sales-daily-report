import React from 'react'

export default function HolidayButton({ onHoliday, disabled }) {
  function handleClick() {
    if (window.confirm('ยืนยันวันหยุด? รายงานวันนี้จะถูกบันทึกเป็น "วันหยุด"')) {
      onHoliday()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 0', borderRadius: 10,
        background: disabled ? '#e0e0e0' : '#FFF9C4',
        border: '1.5px solid #F9A825',
        color: disabled ? '#aaa' : '#F57F17',
        fontSize: 15, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: 8,
      }}
    >
      🌴 วันหยุด
    </button>
  )
}
