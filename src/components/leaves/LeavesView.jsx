'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import LeaveTable from './LeaveTable'
import LeaveModal from './LeaveModal'
import LeaveBalanceCards from './LeaveBalanceCards'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { Plus, Filter } from 'lucide-react'

export default function LeavesView() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [myEmployee, setMyEmployee] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterEmployee, setFilterEmployee] = useState('all')

  const isAdminOrHR = user.role === 'Admin' || user.role === 'HR'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get user profile to get employee ID
      const profile = await apiCall('/auth/profile')
      
      if (isAdminOrHR) {
        // Admin/HR can see all employees and all leaves
        const [leavesData, employeesData] = await Promise.all([
          apiCall('/leaves'),
          apiCall('/employees'),
        ])
        setLeaves(leavesData)
        setEmployees(employeesData)
        
        // Also get their own employee record if they have one
        if (profile.employeeId) {
          setMyEmployee(profile.employeeId)
        }
      } else {
        // Regular employees see only their own leaves
        if (!profile.employeeId) {
          alert('No employee record linked to your account')
          setLoading(false)
          return
        }

        const [employeeData, leavesData] = await Promise.all([
          apiCall(`/employees/${profile.employeeId._id}`),
          apiCall(`/leaves?employeeId=${profile.employeeId._id}`),
        ])
        
        setMyEmployee(employeeData)
        setLeaves(leavesData)
        setEmployees([employeeData])
      }
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

  // Calculate leave balance for the selected employee
  const getLeaveBalance = (employeeId) => {
    const employeeLeaves = leaves.filter(l => 
      l.employee?._id === employeeId && l.status === 'Approved'
    )

    const leaveBalance = {
      CL: { total: 12, taken: 0 },
      SL: { total: 10, taken: 0 },
      EL: { total: 15, taken: 0 },
      Unpaid: { total: 0, taken: 0 },
    }

    employeeLeaves.forEach(leave => {
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      
      if (leaveBalance[leave.leaveType]) {
        leaveBalance[leave.leaveType].taken += days
      }
    })

    return leaveBalance
  }

  // Filter leaves based on selected employee (for Admin/HR)
  const filteredLeaves = filterEmployee === 'all' 
    ? leaves 
    : leaves.filter(l => l.employee?._id === filterEmployee)

  // Determine which employee to show balance for
  const displayEmployeeId = isAdminOrHR 
    ? (filterEmployee === 'all' ? myEmployee?._id : filterEmployee)
    : myEmployee?._id

  const leaveBalance = displayEmployeeId ? getLeaveBalance(displayEmployeeId) : null

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <Button onClick={() => setShowApplyModal(true)}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Apply Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      {leaveBalance && (
        <LeaveBalanceCards 
          leaveBalance={leaveBalance}
          employeeName={
            filterEmployee === 'all' 
              ? 'My Leave Balance' 
              : employees.find(e => e._id === filterEmployee)
                ? `${employees.find(e => e._id === filterEmployee)?.firstName} ${employees.find(e => e._id === filterEmployee)?.lastName}'s Balance`
                : 'Leave Balance'
          }
        />
      )}

      {/* Filter for Admin/HR */}
      {isAdminOrHR && employees.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Employee
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Leave Table */}
      <LeaveTable 
        leaves={filteredLeaves} 
        onUpdateStatus={updateLeaveStatus}
        userRole={user.role}
        showEmployeeColumn={isAdminOrHR && filterEmployee === 'all'}
      />

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <LeaveModal
          employees={employees}
          currentUser={myEmployee}
          isAdminOrHR={isAdminOrHR}
          onClose={() => setShowApplyModal(false)}
          onSubmit={applyLeave}
        />
      )}
    </div>
  )
}