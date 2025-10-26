import React from 'react'
import dayjs from 'dayjs'

export default function HabitCard({ habit, onToggle, onDelete }){
  const today = dayjs().format('YYYY-MM-DD')
  const done = habit.checkins.some(c => c.date === today)

  return (
    <div className="habit-card">
      <div className="habit-info">
        <div className="habit-name">{habit.name}</div>
        <div className="muted small">Streak: {habit.current_streak} days</div>
      </div>
      <div className="habit-actions">
        <button className={`btn ${done ? 'success' : ''}`} onClick={onToggle}>
          {done ? '✓ Done' : 'Mark'}
        </button>
        <button className="btn-small danger" onClick={onDelete} title="Delete habit">
          ×
        </button>
      </div>
    </div>
  )
}
