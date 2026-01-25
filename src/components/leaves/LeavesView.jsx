'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import LeaveTable from './LeaveTable'
import LeaveModal from './LeaveModal'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { Plus } from 'lucide-react'

export default function LeavesView() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [leavesData, employeesData] = await Promise.all([
        apiCall('/leaves'),
        apiCall('/employees'),
      ])
      setLeaves(leavesData)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyLeave = async (formData) => {
    try {
      await apiCall('/leaves', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      fetchData()
      setShowApplyModal(false)
      alert('Leave applied successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  const updateLeaveStatus = async (id, status) => {
    try {
      await apiCall(`/leaves/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      fetchData()
      alert(`Leave ${status.toLowerCase()} successfully!`)
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <Button onClick={() => setShowApplyModal(true)}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Apply Leave
        </Button>
      </div>

      <LeaveTable 
        leaves={leaves} 
        onUpdateStatus={updateLeaveStatus}
        userRole={user.role}
      />

      {showApplyModal && (
        <LeaveModal
          employees={employees}
          onClose={() => setShowApplyModal(false)}
          onSubmit={applyLeave}
        />
      )}
    </div>
  )
}