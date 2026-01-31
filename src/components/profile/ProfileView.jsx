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

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'employee', label: 'Employee Details', show: !!employee },
    { id: 'security', label: 'Security' },
    { id: 'activity', label: 'Activity' },
  ].filter(tab => tab.show !== false)

  return (
    <div>
      <ProfileHeader profile={profile} employee={employee} />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
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
          {activeTab === 'employee' && employee && (
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