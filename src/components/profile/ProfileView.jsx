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
import MyTeamSection from './MyTeamSection'

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

      if (profileData?.employeeId) {
        const empId =
          typeof profileData.employeeId === 'object'
            ? profileData.employeeId._id
            : profileData.employeeId

        const employeeData = await apiCall(`/employees/${empId}`)
        setEmployee(employeeData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  /* ==============================
     Role & Team Checks
  =============================== */
  const canManageTeam = ['Admin', 'HR', 'Business Lead', 'Team Lead'].includes(
    profile?.role
  )

  const hasTeam =
    Array.isArray(profile?.manages) && profile.manages.length > 0

  /* ==============================
     Tabs
  =============================== */
  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'employee', label: 'Employee Details' },
    { id: 'security', label: 'Security' },
    { id: 'activity', label: 'Activity' },
  ]

  // ✅ Add My Team tab dynamically
  if (canManageTeam && hasTeam) {
    tabs.push({ id: 'team', label: 'My Team' })
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader profile={profile} employee={employee} />

      {/* Tabs Container */}
      <div className="bg-white rounded-xl shadow-lg">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-2 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tabs Content */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalInfoTab profile={profile} employee={employee} />
          )}

          {activeTab === 'employee' && (
            <EmployeeInfoTab employee={employee} />
          )}

          {activeTab === 'security' && <SecurityTab />}

          {activeTab === 'activity' && (
            <ActivityTab employee={employee} />
          )}

          {/* ✅ My Team Tab */}
          {activeTab === 'team' && canManageTeam && hasTeam && (
            <MyTeamSection
              manages={profile.manages}
              role={profile.role}
            />
          )}
        </div>
      </div>
    </div>
  )
}
