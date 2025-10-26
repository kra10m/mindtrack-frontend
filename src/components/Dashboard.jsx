import React, { useEffect, useState } from 'react'
import HabitCard from './HabitCard'
import CalendarView from './Calendar'
import dayjs from 'dayjs'

export default function Dashboard({ user }){
  const [habits, setHabits] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHabits()
    const msgs = [
      'Small steps every day — you got this!',
      'Consistency beats intensity. Keep going!',
      'Two minutes today adds up tomorrow.',
      'Celebrate one win — you earned it!'
    ]
    setMessage(msgs[Math.floor(Math.random() * msgs.length)])
  }, [])

  async function loadHabits(){
    try {
      const res = await fetch('/api/progress', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setHabits(data)
      }
    } catch (e) {
      console.error('Failed to load habits', e)
    } finally {
      setLoading(false)
    }
  }

  async function addHabit(habitName){
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: habitName })
      })

      if (res.ok) {
        await loadHabits() // Reload all habits
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add habit')
      }
    } catch (e) {
      alert('Network error')
    }
  }

  async function toggleCheckin(habitId){
    try {
      const res = await fetch(`/api/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}) // No mood rating for now
      })

      if (res.ok) {
        await loadHabits() // Reload to update streak
      } else {
        const data = await res.json()
        if (data.error === 'Already checked in today') {
          alert('Already checked in today!')
        } else {
          alert(data.error || 'Failed to check in')
        }
      }
    } catch (e) {
      alert('Network error')
    }
  }

  async function deleteHabit(habitId){
    if (!confirm('Delete this habit?')) return

    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        await loadHabits()
      } else {
        alert('Failed to delete habit')
      }
    } catch (e) {
      alert('Network error')
    }
  }

  if (loading) return <div className="loading">Loading habits...</div>

  return (
    <div className="grid">
      <section className="left">
        <div className="card head-card">
          <div className="card-row">
            <h2>Today's Habits</h2>
            <div className="motivation">{message}</div>
          </div>

          <div className="habits-grid">
            {habits.length === 0 ? (
              <p className="muted">No habits yet. Add your first one below!</p>
            ) : (
              habits.map(h => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  onToggle={() => toggleCheckin(h.id)}
                  onDelete={() => deleteHabit(h.id)}
                />
              ))
            )}
          </div>

          <AddHabitForm onAdd={addHabit} />
        </div>

        <div className="card">
          <h3>Streaks & Progress</h3>
          <CalendarView habits={habits} />
        </div>
      </section>

      <aside className="right">
        <div className="card">
          <h3>Insights</h3>
          <Insights habits={habits} />
        </div>

        <div className="card">
          <h4>Tips</h4>
          <p className="muted">Build habits one day at a time. Small wins compound!</p>
        </div>
      </aside>
    </div>
  )
}

function AddHabitForm({ onAdd }){
  const [val, setVal] = useState('')
  return (
    <div className="add-habit">
      <input
        className="input"
        placeholder="Add habit (e.g., Read 20 min)"
        value={val}
        onChange={e=>setVal(e.target.value)}
      />
      <button
        className="btn"
        onClick={() => {
          if(val.trim()){
            onAdd(val.trim());
            setVal('')
          }
        }}
      >
        Add
      </button>
    </div>
  )
}

function Insights({ habits }){
  const totalCheckins = habits.reduce((sum, h) => sum + h.checkins.length, 0)
  const avgStreak = habits.length > 0
    ? (habits.reduce((sum, h) => sum + h.current_streak, 0) / habits.length).toFixed(1)
    : 0

  return (
    <div>
      <p className="muted">Tracked habits: <strong>{habits.length}</strong></p>
      <p className="muted">Total check-ins: <strong>{totalCheckins}</strong></p>
      <p className="muted">Avg streak: <strong>{avgStreak} days</strong></p>
      {habits.length > 0 && (
        <div className="weekly-list">
          <h5>Weekly Averages</h5>
          {habits.map(h => (
            <div key={h.id} className="week-row">
              <span>{h.name}</span>
              <span>{h.weekly_average}/week</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
