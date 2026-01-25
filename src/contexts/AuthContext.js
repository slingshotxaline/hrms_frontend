'use client'

import React, { createContext, useState, useContext } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage directly instead of using useEffect
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        return JSON.parse(userData)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        return null
      }
    }
    return null
  })
  
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}