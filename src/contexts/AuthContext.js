'use client'

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiCall } from '@/lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // ✅ Initialize user state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        // Parse initial user data
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Fetch fresh profile data to sync role
        try {
          const profile = await apiCall('/auth/profile')
          
          const updatedUser = {
            _id: profile._id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            employeeId: profile.employeeId,
          }
          
          localStorage.setItem('user', JSON.stringify(updatedUser))
          setUser(updatedUser)
          
          console.log('✅ User profile refreshed:', updatedUser.role)
        } catch (error) {
          console.error('Error refreshing profile:', error)
          // Keep the cached user data if refresh fails
        }
      }
      
      setLoading(false)
    }

    initializeAuth()
  }, []) // Only run once on mount

  // ✅ Separate function for manual profile refresh
  const refreshUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const profile = await apiCall('/auth/profile')
      
      const updatedUser = {
        _id: profile._id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        employeeId: profile.employeeId,
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      console.log('✅ User profile refreshed:', updatedUser.role)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }, [])

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
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUserProfile }}>
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