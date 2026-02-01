'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import AttendanceTable from './AttendanceTable'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { Clock, Calendar as CalendarIcon } from 'lucide-react'
import MarkAttendanceModal from './MarkAttendanceModal'

export default function AttendanceView() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [myEmployee, setMyEmployee] = useState(null)
  const [userRole, setUserRole] = useState(null) // ✅ Store the actual role
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching attendance data...')
      
      // Get fresh profile data
      const profile = await apiCall('/auth/profile')
      console.log('👤 User profile:', profile)
      console.log('🎭 User role from profile:', profile.role)
      
      // ✅ Set the actual role from profile
      setUserRole(profile.role)
      
      // Determine role-based permissions using PROFILE ROLE
      const isAdmin = profile.role === 'Admin'
      const isHR = profile.role === 'HR'
      const isLeader = ['Business Lead', 'Team Lead'].includes(profile.role)
      const canSeeAll = isAdmin || isHR
      
      console.log('✅ Permissions:', { isAdmin, isHR, isLeader, canSeeAll })
      
      // Calculate date range for selected month/year
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
      
      console.log('📅 Date range:', { startDate, endDate })
      
      if (canSeeAll) {
        // Admin/HR can see all employees
        console.log('✅ Admin/HR - Fetching all employees')
        
        const [attendanceData, employeesData] = await Promise.all([
          apiCall(`/attendance?startDate=${startDate}&endDate=${endDate}`),
          apiCall('/employees'),
        ])
        
        console.log('📊 All attendance records:', attendanceData.length)
        console.log('👥 All employees:', employeesData.length)
        
        setAttendance(attendanceData)
        setEmployees(employeesData)
        
        // Get their own employee record if exists
        if (profile.employeeId) {
          const empData = await apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`)
          setMyEmployee(empData)
        }
        
      } else if (isLeader) {
        // Leaders can see their team + their own
        console.log('👔 Leader - Fetching team data')
        
        try {
          const teamData = await apiCall('/roles/my-team')
          console.log('👥 My team data:', teamData)
          console.log('📋 Team size:', teamData.teamSize)
          console.log('👥 Team members:', teamData.team)
          
          // Get my employee record
          let myEmpData = null
          if (profile.employeeId) {
            myEmpData = await apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`)
            setMyEmployee(myEmpData)
            console.log('✅ My employee record:', myEmpData.employeeCode)
          }
          
          // Build list of employee IDs to fetch attendance for
          const teamMembers = teamData.team || []
          console.log('📋 Processing team members:', teamMembers.length)
          
          // Extract employee IDs from team members
          const teamEmployeeIds = []
          const teamEmployeeRecords = []
          
          for (const member of teamMembers) {
            console.log('🔍 Team member:', member.name, 'Employee ID:', member.employeeId)
            
            if (member.employeeId) {
              const empId = member.employeeId._id || member.employeeId
              teamEmployeeIds.push(empId)
              
              // If employeeId is populated, add it directly
              if (member.employeeId.firstName) {
                teamEmployeeRecords.push(member.employeeId)
              } else {
                // Otherwise fetch the full employee record
                try {
                  const empRecord = await apiCall(`/employees/${empId}`)
                  teamEmployeeRecords.push(empRecord)
                } catch (err) {
                  console.error('Error fetching employee:', empId, err)
                }
              }
            }
          }
          
          console.log('✅ Team employee IDs:', teamEmployeeIds)
          
          // Add my own employee ID if exists
          const allEmployeeIds = myEmpData 
            ? [myEmpData._id, ...teamEmployeeIds]
            : teamEmployeeIds
          
          console.log('🔍 Fetching attendance for employee IDs:', allEmployeeIds)
          
          // Fetch attendance for all employees
          if (allEmployeeIds.length > 0) {
            const attendancePromises = allEmployeeIds.map(empId => {
              console.log('📊 Fetching attendance for employee:', empId)
              return apiCall(`/attendance?employeeId=${empId}&startDate=${startDate}&endDate=${endDate}`)
            })
            
            const attendanceResults = await Promise.all(attendancePromises)
            const allAttendance = attendanceResults.flat()
            
            console.log('✅ Total attendance records:', allAttendance.length)
            console.log('📊 Attendance breakdown:', allAttendance.map(a => ({
              employee: a.employee?.firstName + ' ' + a.employee?.lastName,
              date: a.date,
              status: a.status
            })))
            
            setAttendance(allAttendance)
          } else {
            console.log('⚠️ No employee IDs found')
            setAttendance([])
          }
          
          // Build employees list
          const allEmployees = myEmpData 
            ? [myEmpData, ...teamEmployeeRecords]
            : teamEmployeeRecords
          
          console.log('👥 Total employees list:', allEmployees.length)
          console.log('👥 Employees:', allEmployees.map(e => e.firstName + ' ' + e.lastName))
          setEmployees(allEmployees)
          
        } catch (error) {
          console.error('❌ Error fetching team data:', error)
          alert('Error loading team data: ' + error.message)
          
          // If team fetch fails, at least show own data
          if (profile.employeeId) {
            const empData = await apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`)
            setMyEmployee(empData)
            
            const attendanceData = await apiCall(`/attendance?employeeId=${empData._id}&startDate=${startDate}&endDate=${endDate}`)
            setAttendance(attendanceData)
            setEmployees([empData])
          }
        }
        
      } else {
        // Regular employees see only their own
        console.log('👤 Regular employee - Fetching own data')
        
        if (!profile.employeeId) {
          alert('No employee record found')
          setLoading(false)
          return
        }
        
        const [empData, attendanceData] = await Promise.all([
          apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`),
          apiCall(`/attendance?employeeId=${profile.employeeId._id || profile.employeeId}&startDate=${startDate}&endDate=${endDate}`),
        ])
        
        console.log('✅ Own attendance:', attendanceData.length)
        
        setMyEmployee(empData)
        setAttendance(attendanceData)
        setEmployees([empData])
      }
    } catch (error) {
      console.error('❌ Error fetching attendance:', error)
      alert('Error loading attendance data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (employeeCode, type) => {
    try {
      await apiCall('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          employeeCode,
          timestamp: new Date().toISOString(),
          type,
        }),
      })
      fetchData()
      setShowMarkModal(false)
      alert(`Attendance ${type} marked successfully!`)
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <Loading />

  // Use the role from state (fetched from profile)
  const isAdmin = userRole === 'Admin'
  const isHR = userRole === 'HR'
  const isLeader = ['Business Lead', 'Team Lead'].includes(userRole)
  const canSeeAll = isAdmin || isHR

  // Filter attendance based on selected employee
  const filteredAttendance = filterEmployee === 'all' 
    ? attendance 
    : attendance.filter(a => a.employee?._id === filterEmployee)

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">
            {canSeeAll ? 'View and manage all employee attendance' :
             isLeader ? `View your team's attendance (${employees.length} ${employees.length === 1 ? 'member' : 'members'})` :
             'View your attendance records'}
          </p>
        </div>
        <Button onClick={() => setShowMarkModal(true)}>
          <Clock className="w-5 h-5 mr-2 inline" />
          Mark Attendance
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i
                return (
                  <option key={year} value={year}>{year}</option>
                )
              })}
            </select>
          </div>

          {/* Employee Filter */}
          {(canSeeAll || (isLeader && employees.length > 1)) && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Employee
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All {isLeader ? 'Team Members' : 'Employees'}</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Range Info */}
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>
            Showing: {monthName} {selectedYear}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-indigo-600 font-medium">
            {filteredAttendance.length} records
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Records"
          value={filteredAttendance.length}
          color="bg-blue-500"
        />
        <StatCard
          label="Present"
          value={filteredAttendance.filter(a => a.status === 'Present').length}
          color="bg-green-500"
        />
        <StatCard
          label="Absent"
          value={filteredAttendance.filter(a => a.status === 'Absent').length}
          color="bg-red-500"
        />
        <StatCard
          label="On Leave"
          value={filteredAttendance.filter(a => a.status === 'Leave').length}
          color="bg-yellow-500"
        />
        <StatCard
          label="Late Days"
          value={filteredAttendance.filter(a => a.lateMinutes > 0).length}
          color="bg-orange-500"
        />
      </div>

      {/* Attendance Table */}
      <AttendanceTable 
        attendance={filteredAttendance} 
        showEmployeeColumn={filterEmployee === 'all' && employees.length > 1}
      />

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <MarkAttendanceModal
          myEmployee={myEmployee}
          onClose={() => setShowMarkModal(false)}
          onMark={markAttendance}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center`}>
          <Clock className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
