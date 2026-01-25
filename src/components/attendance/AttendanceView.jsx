'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '@/lib/api'
import AttendanceTable from './AttendanceTable'
import AttendanceFilters from './AttendanceFilters'
import MarkAttendanceModal from './MarkAttendanceModal'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { Clock } from 'lucide-react'

export default function AttendanceView() {
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      const [attendanceData, employeesData] = await Promise.all([
        apiCall(`/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        apiCall('/employees'),
      ])
      setAttendance(attendanceData)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching attendance:', error)
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
      alert(`Attendance ${type} marked successfully!`)
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <Button onClick={() => setShowMarkModal(true)}>
          <Clock className="w-5 h-5 mr-2 inline" />
          Mark Attendance
        </Button>
      </div>

      <AttendanceFilters 
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <AttendanceTable attendance={attendance} />

      {showMarkModal && (
        <MarkAttendanceModal
          employees={employees}
          onClose={() => setShowMarkModal(false)}
          onMark={markAttendance}
        />
      )}
    </div>
  )
}