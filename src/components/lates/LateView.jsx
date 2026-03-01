'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import Button from '@/components/common/Button'
import LateTable from './LateTable'
import ApplyLateModal from './ApplyLateModal'
import RejectLateModal from './RejectLateModal'
import LateSettingsModal from './LateSettingsModal'
import { Clock, Plus, Filter, Settings, AlertCircle } from 'lucide-react'

export default function LateView() {
  const { user } = useAuth()
  const [lates, setLates] = useState([])
  const [myAttendances, setMyAttendances] = useState([]) // ✅ Unapplied late attendances
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedLate, setSelectedLate] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const isAdmin = user?.role === 'Admin'
  const isHR = user?.role === 'HR'
  const isBusinessLead = user?.role === 'Business Lead'
  const isTeamLead = user?.role === 'Team Lead'
  const isEmployee = user?.role === 'Employee'
  const isLeader = isBusinessLead || isTeamLead

  // ✅ ALL roles can apply for late (including Business Lead, Team Lead, HR, Admin)
  const canApplyLate = true

  // ✅ Leaders, HR, Admin can approve/reject
  const canApprove = isAdmin || isHR || isLeader

  useEffect(() => {
    fetchLates()
    fetchMyLateAttendances() // ✅ Always fetch for ALL roles
  }, [filterStatus])

  // ✅ Fetch late applications list
  const fetchLates = async () => {
    try {
      console.log('🔍 Fetching late applications...')
      const query = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const latesData = await apiCall(`/lates${query}`)
      console.log(`📋 Fetched ${latesData.length} late applications`)
      setLates(latesData)
    } catch (error) {
      console.error('❌ Error fetching lates:', error)
    }
  }

  // ✅ Fetch MY late attendances that haven't been applied yet (ALL ROLES)
  const fetchMyLateAttendances = async () => {
    try {
      console.log(`🔍 Fetching my late attendances for role: ${user?.role}`)

      // Get current month date range
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]

      console.log(`📅 Date range: ${startDate} to ${endDate}`)

      // ✅ Fetch my attendance records
      const attendanceData = await apiCall(
        `/attendance/my?startDate=${startDate}&endDate=${endDate}`
      )

      console.log(`📊 Total attendance records: ${attendanceData.length}`)

      // ✅ Fetch existing late applications to filter out already-applied ones
      const query = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const latesData = await apiCall(`/lates${query}`)

      // ✅ Filter: Only late attendances without existing applications
      const unappliedLateAttendances = attendanceData.filter(att => {
        // Must be late
        if (!att.lateMinutes || att.lateMinutes <= 0) return false

        // Must not already have a late application
        const alreadyApplied = latesData.some(late => {
          const lateAttId = late.attendance?._id || late.attendance
          return lateAttId?.toString() === att._id?.toString()
        })

        return !alreadyApplied
      })

      console.log(`⏰ Unapplied late attendances: ${unappliedLateAttendances.length}`)
      setMyAttendances(unappliedLateAttendances)
    } catch (error) {
      console.error('❌ Error fetching my late attendances:', error)
      setMyAttendances([])
    }
  }

  // ✅ Refresh all data
  const fetchData = async () => {
    setLoading(true)
    try {
      await fetchLates()
      await fetchMyLateAttendances()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (lateId) => {
    if (!confirm('Are you sure you want to approve this late application?')) return

    try {
      console.log(`✅ Approving late ${lateId}`)
      await apiCall(`/lates/${lateId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Approved' }),
      })
      alert('Late approved successfully!')
      fetchData()
    } catch (error) {
      console.error('❌ Error approving late:', error)
      alert('Error approving late: ' + error.message)
    }
  }

  const handleReject = (lateId) => {
    setSelectedLate(lateId)
    setShowRejectModal(true)
  }

  const confirmReject = async (rejectionReason) => {
    try {
      await apiCall(`/lates/${selectedLate}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected', rejectionReason }),
      })
      alert('Late rejected successfully!')
      setShowRejectModal(false)
      setSelectedLate(null)
      fetchData()
    } catch (error) {
      alert('Error rejecting late: ' + error.message)
    }
  }

  const handleDelete = async (lateId) => {
    if (!confirm('Are you sure you want to delete this late application?')) return
    try {
      await apiCall(`/lates/${lateId}`, { method: 'DELETE' })
      alert('Late application deleted!')
      fetchData()
    } catch (error) {
      alert('Error deleting: ' + error.message)
    }
  }

  if (loading) return <Loading />

  const stats = {
    total: lates.length,
    pending: lates.filter(l => l.status === 'Pending').length,
    approved: lates.filter(l => l.status === 'Approved').length,
    rejected: lates.filter(l => l.status === 'Rejected').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Late Management</h1>
          <p className="text-gray-600 mt-1">
            {canApprove
              ? 'Manage and apply for late approvals'
              : 'View and apply for late approvals'}
          </p>
        </div>
        <div className="flex gap-3">
          {/* ✅ Settings button - Admin only */}
          {isAdmin && (
            <Button
              onClick={() => setShowSettingsModal(true)}
              variant="outline"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
          )}

          {/* ✅ Apply for Late button - ALL roles see this if they have unapplied lates */}
          {myAttendances.length > 0 && (
            <Button
              onClick={() => setShowApplyModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Apply for Late ({myAttendances.length})
            </Button>
          )}
        </div>
      </div>

      {/* ✅ Warning Banner - Shows for ALL roles with unapplied lates */}
      {myAttendances.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">
                You have {myAttendances.length} unapplied late arrival(s) this month
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Apply for late approval to avoid deductions from your salary or leave balance.
                {isLeader && ' As a team leader, you also need to apply for your own late arrivals.'}
              </p>
              <Button
                onClick={() => setShowApplyModal(true)}
                size="sm"
                className="mt-3 bg-yellow-600 hover:bg-yellow-700"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ No Late Attendances Info */}
      {myAttendances.length === 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">
              ✓ No unapplied late arrivals this month
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Applications" value={stats.total} color="bg-blue-500" />
        <StatCard label="Pending" value={stats.pending} color="bg-yellow-500" />
        <StatCard label="Approved" value={stats.approved} color="bg-green-500" />
        <StatCard label="Rejected" value={stats.rejected} color="bg-red-500" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <div className="flex gap-2">
            {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? status === 'all' ? 'bg-indigo-600 text-white'
                      : status === 'Pending' ? 'bg-yellow-600 text-white'
                      : status === 'Approved' ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
                {status !== 'all' && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/30">
                    {stats[status.toLowerCase()]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Late Table */}
      <LateTable
        lates={lates}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        canApprove={canApprove}
        currentUserId={user?._id}
      />

      {/* Apply Late Modal */}
      {showApplyModal && (
        <ApplyLateModal
          attendances={myAttendances}
          onClose={() => setShowApplyModal(false)}
          onSubmit={fetchData}
        />
      )}

      {/* Reject Late Modal */}
      {showRejectModal && (
        <RejectLateModal
          onClose={() => {
            setShowRejectModal(false)
            setSelectedLate(null)
          }}
          onConfirm={confirmReject}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <LateSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onUpdate={fetchData}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Clock className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}