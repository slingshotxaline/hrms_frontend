'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import Button from '@/components/common/Button'
import RoleTable from './RoleTable'
import HierarchyTree from './HierarchyTree'
import AssignManagerModal from './AssignManagerModal'
import BulkAssignModal from './BulkAssignModal'
import { Users, GitBranch, Shield, UserPlus, AlertCircle } from 'lucide-react'

export default function RoleManagementView() {
  const { user, refreshUserProfile } = useAuth() // ✅ Get refreshUserProfile
  const [users, setUsers] = useState([])
  const [hierarchy, setHierarchy] = useState([])
  const [myTeam, setMyTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const isAdmin = user.role === 'Admin'
  const isHR = user.role === 'HR'
  const isLeader = ['Team Lead', 'Business Lead'].includes(user.role)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Fetching role data...')
      
      const [usersData, hierarchyData] = await Promise.all([
        apiCall('/roles'),
        apiCall('/roles/hierarchy'),
      ])

      console.log('Users fetched:', usersData.length)
      console.log('Hierarchy fetched:', hierarchyData.length)

      setUsers(usersData)
      setHierarchy(hierarchyData)

      // Get my team if I'm a leader
      if (isLeader || isHR || isAdmin) {
        try {
          const teamData = await apiCall('/roles/my-team')
          console.log('My team size:', teamData.teamSize)
          setMyTeam(teamData.team || [])
        } catch (teamError) {
          console.log('No team data or error:', teamError.message)
          setMyTeam([])
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      setError(error.message || 'Failed to load role data')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return
    }

    try {
      await apiCall(`/roles/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      })
      
      // ✅ If the user changed their own role, refresh their profile
      if (userId === user._id) {
        console.log('🔄 Own role changed, refreshing profile...')
        await refreshUserProfile()
        alert('Your role has been updated! The page will reload.')
        window.location.reload() // Force reload to update all components
      } else {
        fetchData()
        alert('Role updated successfully!')
      }
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAssignManager = async (userId, managerId) => {
    try {
      await apiCall(`/roles/${userId}/assign-manager`, {
        method: 'PUT',
        body: JSON.stringify({ managerId }),
      })
      
      // ✅ If user assigned themselves a manager, refresh profile
      if (userId === user._id) {
        await refreshUserProfile()
      }
      
      fetchData()
      setShowAssignModal(false)
      setSelectedUser(null)
      alert('Manager assigned successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleRemoveManager = async (userId) => {
    if (!confirm('Are you sure you want to remove this manager assignment?')) return

    try {
      await apiCall(`/roles/${userId}/remove-manager`, {
        method: 'DELETE',
      })
      
      // ✅ If user removed their own manager, refresh profile
      if (userId === user._id) {
        await refreshUserProfile()
      }
      
      fetchData()
      alert('Manager removed successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleBulkAssign = async (managerId, employeeIds) => {
    try {
      await apiCall('/roles/bulk-assign', {
        method: 'POST',
        body: JSON.stringify({ managerId, employeeIds }),
      })
      
      // ✅ If user assigned themselves to someone, refresh profile
      if (employeeIds.includes(user._id)) {
        await refreshUserProfile()
      }
      
      fetchData()
      setShowBulkAssignModal(false)
      alert('Employees assigned successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Role Management</h3>
              <p className="text-sm text-red-700 mt-2">{error}</p>
              <Button onClick={fetchData} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'users', label: 'All Users', icon: Users, show: isAdmin || isHR },
    { id: 'hierarchy', label: 'Organization Chart', icon: GitBranch, show: isAdmin || isHR },
    { id: 'myteam', label: 'My Team', icon: UserPlus, show: isLeader || isHR || isAdmin },
  ].filter(tab => tab.show)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Role Management</h1>
          <p className="text-black mt-1">Manage roles and organizational hierarchy</p>
        </div>
        {(isAdmin || isHR) && users.length > 0 && (
          <Button className='bg-black' onClick={() => setShowBulkAssignModal(true)}>
            <UserPlus className="w-5 h-5 mr-2 inline" />
            Bulk Assign
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Shield}
          label="Admins"
          value={users.filter(u => u.role === 'Admin').length}
          color="bg-red-500"
        />
        <StatsCard
          icon={Users}
          label="HR Team"
          value={users.filter(u => u.role === 'HR').length}
          color="bg-blue-500"
        />
        <StatsCard
          icon={GitBranch}
          label="Business Leads"
          value={users.filter(u => u.role === 'Business Lead').length}
          color="bg-purple-500"
        />
        <StatsCard
          icon={Users}
          label="Team Leads"
          value={users.filter(u => u.role === 'Team Lead').length}
          color="bg-green-500"
        />
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">No Users Found</h3>
              <p className="text-sm text-yellow-700 mt-2">
                No users are available in the system. Users need to be created through the registration process or employee management.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {users.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-black hover:text-black'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <RoleTable
                users={users}
                onRoleChange={handleRoleChange}
                onAssignManager={(user) => {
                  setSelectedUser(user)
                  setShowAssignModal(true)
                }}
                onRemoveManager={handleRemoveManager}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'hierarchy' && (
              <HierarchyTree hierarchy={hierarchy} />
            )}
            {activeTab === 'myteam' && (
              <MyTeamView team={myTeam} />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAssignModal && selectedUser && (
        <AssignManagerModal
          user={selectedUser}
          managers={users.filter(u => 
            ['Admin', 'HR', 'Business Lead', 'Team Lead'].includes(u.role) &&
            u._id !== selectedUser._id
          )}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedUser(null)
          }}
          onAssign={handleAssignManager}
        />
      )}

      {showBulkAssignModal && (
        <BulkAssignModal
          employees={users.filter(u => !['Admin'].includes(u.role))}
          managers={users.filter(u => 
            ['Admin', 'HR', 'Business Lead', 'Team Lead'].includes(u.role)
          )}
          onClose={() => setShowBulkAssignModal(false)}
          onAssign={handleBulkAssign}
        />
      )}
    </div>
  )
}

function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black mb-1">{label}</p>
          <p className="text-3xl font-bold text-black">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function MyTeamView({ team }) {
  if (team.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-black mx-auto mb-4" />
        <p className="text-black">No team members assigned yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {team.map(member => (
        <div key={member._id} className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-black">{member.name}</h3>
              <p className="text-sm text-black">{member.email}</p>
            </div>
          </div>
          {member.employeeId && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black">Code:</span>
                <span className="font-semibold">{member.employeeId.employeeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Department:</span>
                <span className="font-semibold">{member.employeeId.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Designation:</span>
                <span className="font-semibold">{member.employeeId.designation}</span>
              </div>
            </div>
          )}
          <div className="mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              member.role === 'Team Lead' ? 'bg-green-100 text-green-800' :
              member.role === 'Business Lead' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {member.role}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}