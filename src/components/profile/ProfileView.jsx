'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import ProfileHeader from './ProfileHeader'
import PersonalInfoTab from './PersonalInfoTab'
import EmployeeInfoTab from './EmployeeInfoTab'
import SecurityTab from './SecurityTab'
import ActivityTab from './ActivityTab'

export default function ProfileView() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const profileData = await apiCall('/auth/profile')
      setProfile(profileData)

      if (profileData.employeeId) {
        const empData = await apiCall(`/employees/${profileData.employeeId._id || profileData.employeeId}`)
        setEmployee(empData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updatedData) => {
    try {
      await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      })
      fetchProfile()
      alert('Profile updated successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  const updatePassword = async (passwordData) => {
    try {
      await apiCall('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
      })
      alert('Password updated successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <Loading />

  // All users should have employee records
  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">No Employee Record Found</h3>
              <p className="text-sm text-yellow-700 mt-2">
                Your account doesn&apos;t have an employee profile linked. Please contact HR or Admin to create your employee record.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'employee', label: 'Employee Details' },
    { id: 'security', label: 'Security' },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <div>
      <ProfileHeader profile={profile} employee={employee} />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalInfoTab 
              profile={profile} 
              onUpdate={updateProfile}
            />
          )}
          {activeTab === 'employee' && (
            <EmployeeInfoTab employee={employee} />
          )}
          {activeTab === 'security' && (
            <SecurityTab onUpdatePassword={updatePassword} />
          )}
          {activeTab === 'activity' && (
            <ActivityTab employeeId={employee?._id} />
          )}
        </div>
      </div>
    </div>
  )
}