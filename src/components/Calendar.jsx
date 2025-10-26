import React from 'react'
import dayjs from 'dayjs'

export default function CalendarView({ habits }) {
  const days = []
  for (let i = 29; i >= 0; i--){
    days.push(dayjs().subtract(i, 'day'))
  }

  const dateHasCheckin = (date) => {
    return habits.some(h =>
      h.checkins.some(c => c.date === date)
    )
  }

  return (
    <div>
      <div className="calendar-grid">
        {days.map(d => {
          const dateStr = d.format('YYYY-MM-DD')
          const has = dateHasCheckin(dateStr)
          return (
            <div key={dateStr} className={`calendar-day ${has ? 'green' : ''}`}>
              <div className="day-num">{d.format('D')}</div>
            </div>
          )
        })}
      </div>
      <div className="muted small">Green days = you completed at least one habit.</div>
    </div>
  )
}
