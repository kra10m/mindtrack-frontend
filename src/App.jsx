import React, { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'

export default function App(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth(){
    try {
      const res = await fetch('/api/habits', { credentials: 'include' })
      if (res.ok) {
        // User is authenticated, get username from session
        const username = localStorage.getItem('username') || 'User'
        setUser({ name: username })
      }
    } catch (e) {
      console.log('Not authenticated')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(username, password){
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        localStorage.setItem('username', username)
        setUser({ name: username })
        return { success: true }
      } else {
        const data = await res.json()
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (e) {
      return { success: false, error: 'Network error' }
    }
  }

  async function handleRegister(username, password){
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        // After registration, automatically log in
        return await handleLogin(username, password)
      } else {
        const data = await res.json()
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (e) {
      return { success: false, error: 'Network error' }
    }
  }

  async function handleLogout(){
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (e) {
      console.log('Logout error')
    }
    localStorage.removeItem('username')
    setUser(null)
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Auth onLogin={handleLogin} onRegister={handleRegister} />

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>MindTrack</h1>
        <div className="user-area">
          <span>Hi, <strong>{user.name}</strong></span>
          <button className="btn danger" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Dashboard user={user} />
        </div>
      </main>

      <footer className="footer">MindTrack • Habit Tracker</footer>
    </div>
  )
}

function Auth({ onLogin, onRegister }){
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = isLogin
      ? await onLogin(username, password)
      : await onRegister(username, password)

    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={e=>setUsername(e.target.value)}
            placeholder="Username"
            className="input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Password"
            className="input"
            required
            minLength={3}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit" disabled={loading || !username.trim() || !password.trim()}>
            {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        <p className="muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button className="link-btn" onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}
