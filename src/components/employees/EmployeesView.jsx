'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '@/lib/api'
import EmployeeTable from './EmployeeTable'
import EmployeeModal from './EmployeeModal'
import CreateUserModal from './CreateUserModal'
import ResetPasswordModal from './ResetPasswordModal'
import SearchBar from '@/components/common/SearchBar'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { Plus } from 'lucide-react'

export default function EmployeesView() {
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const data = await apiCall('/employees')
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingEmployee) {
        await apiCall(`/employees/${editingEmployee._id}`, { method: 'PUT', body: JSON.stringify(formData) })
      } else {
        await apiCall('/employees', { method: 'POST', body: JSON.stringify(formData) })
      }
      fetchEmployees()
      setShowModal(false)
      setEditingEmployee(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleCreateUser = async (userData) => {
    try {
      await apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) })
      alert(`Account created!\n\nEmail: ${userData.email}\nPassword: ${userData.password}`)
      setShowUserModal(false)
      setSelectedEmployee(null)
      fetchEmployees()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleResetPassword = async (resetData) => {
    try {
      await apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify(resetData) })
      alert('Password reset successfully!')
      setShowResetModal(false)
      setSelectedEmployee(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search employees..." />
      </div>

      <EmployeeTable
        employees={filteredEmployees}
        onEdit={(emp) => { setEditingEmployee(emp); setShowModal(true) }}
        onCreateUser={(emp) => { setSelectedEmployee(emp); setShowUserModal(true) }}
        onResetPassword={(emp) => { setSelectedEmployee(emp); setShowResetModal(true) }}
      />

      {showModal && (
        <EmployeeModal employee={editingEmployee} onClose={() => { setShowModal(false); setEditingEmployee(null) }} onSave={handleSave} />
      )}
      {showUserModal && selectedEmployee && (
        <CreateUserModal employee={selectedEmployee} onClose={() => { setShowUserModal(false); setSelectedEmployee(null) }} onSubmit={handleCreateUser} />
      )}
      {showResetModal && selectedEmployee && (
        <ResetPasswordModal employee={selectedEmployee} onClose={() => { setShowResetModal(false); setSelectedEmployee(null) }} onSubmit={handleResetPassword} />
      )}
    </div>
  )
}