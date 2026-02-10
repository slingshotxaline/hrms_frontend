'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import EmployeeTable from './EmployeeTable'
import EmployeeModal from './EmployeeModal'
import CreateUserModal from './CreateUserModal'
import ResetPasswordModal from './ResetPasswordModal'
import SearchBar from '@/components/common/SearchBar'
import { UserPlus, Users, Download } from 'lucide-react'

export default function EmployeesView() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('') // ✅ Initialized as string
  const [showModal, setShowModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const isAdmin = user?.role === 'Admin'
  const isHR = user?.role === 'HR'
  const canManage = isAdmin || isHR

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [searchQuery, employees])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await apiCall('/employees')
      console.log('✅ Employees loaded:', data.length)
      setEmployees(data)
      setFilteredEmployees(data)
    } catch (error) {
      console.error('❌ Error fetching employees:', error)
      alert('Error loading employees: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    // ✅ Safe handling of searchQuery
    const query = String(searchQuery || '').trim().toLowerCase()
    
    if (!query) {
      setFilteredEmployees(employees)
      return
    }

    const filtered = employees.filter(emp => {
      const firstName = String(emp.firstName || '').toLowerCase()
      const lastName = String(emp.lastName || '').toLowerCase()
      const employeeCode = String(emp.employeeCode || '').toLowerCase()
      const email = String(emp.email || '').toLowerCase()
      const department = String(emp.department || '').toLowerCase()
      const designation = String(emp.designation || '').toLowerCase()
      
      return firstName.includes(query) ||
             lastName.includes(query) ||
             employeeCode.includes(query) ||
             email.includes(query) ||
             department.includes(query) ||
             designation.includes(query)
    })
    
    setFilteredEmployees(filtered)
  }

  const handleAddEmployee = async (employeeData) => {
    try {
      console.log('➕ Adding new employee:', employeeData)
      const newEmployee = await apiCall('/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData),
      })
      console.log('✅ Employee added successfully:', newEmployee)
      await fetchEmployees()
      setShowModal(false)
      alert('Employee added successfully!')
    } catch (error) {
      console.error('❌ Error adding employee:', error)
      throw error
    }
  }

  const handleEditEmployee = async (employeeData) => {
    try {
      console.log('✏️ Updating employee:', selectedEmployee._id, employeeData)
      await apiCall(`/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData),
      })
      console.log('✅ Employee updated successfully')
      await fetchEmployees()
      setShowModal(false)
      setSelectedEmployee(null)
      alert('Employee updated successfully!')
    } catch (error) {
      console.error('❌ Error updating employee:', error)
      throw error
    }
  }

  const handleCreateUser = (employee) => {
    console.log('👤 Opening create user modal for:', employee)
    setSelectedEmployee(employee)
    setShowCreateUserModal(true)
  }

  const handleResetPassword = (employee) => {
    console.log('🔑 Opening reset password modal for:', employee)
    setSelectedEmployee(employee)
    setShowResetPasswordModal(true)
  }

  const openEditModal = (employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  const openAddModal = () => {
    setSelectedEmployee(null)
    setShowModal(true)
  }

  const handleExport = () => {
    const headers = ['Employee Code', 'Name', 'Email', 'Department', 'Designation', 'Joining Date', 'Salary', 'Account Status', 'Active Status']
    const rows = filteredEmployees.map(emp => [
      emp.employeeCode,
      `${emp.firstName} ${emp.lastName}`,
      emp.email,
      emp.department,
      emp.designation,
      new Date(emp.dateOfJoining).toLocaleDateString(),
      emp.grossSalary,
      emp.user ? 'Active' : 'No Account',
      emp.isActive ? 'Active' : 'Inactive'
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Employee Management</h1>
          <p className="text-black mt-1">
            Manage your organization&apos;s employees
          </p>
        </div>
        {canManage && (
          <div className="flex gap-3">
            <Button onClick={handleExport} variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
            <Button onClick={openAddModal}>
              <UserPlus className="w-5 h-5 mr-2" />
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Total</p>
              <p className="text-3xl font-bold text-black mt-2">{employees.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Active</p>
              <p className="text-3xl font-bold text-black mt-2">
                {employees.filter(e => e.isActive).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Has Account</p>
              <p className="text-3xl font-bold text-black mt-2">
                {employees.filter(e => e.user).length}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Departments</p>
              <p className="text-3xl font-bold text-black mt-2">
                {new Set(employees.map(e => e.department)).size}
              </p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Avg Salary</p>
              <p className="text-2xl font-bold text-black mt-2">
                ৳{employees.length > 0 
                  ? Math.round(employees.reduce((sum, e) => sum + (e.grossSalary || 0), 0) / employees.length).toLocaleString()
                  : 0}
              </p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery} // ✅ Passes value directly
          placeholder="Search by name, code, email, department, or designation..."
        />
      </div>

      {/* Employees Table */}
      <EmployeeTable
        employees={filteredEmployees}
        onEdit={canManage ? openEditModal : null}
        onCreateUser={isAdmin ? handleCreateUser : null}
        onResetPassword={isAdmin ? handleResetPassword : null}
        onRefresh={fetchEmployees}
      />

      {/* Modals */}
      {showModal && (
        <EmployeeModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedEmployee(null)
          }}
          onSubmit={selectedEmployee ? handleEditEmployee : handleAddEmployee}
          employee={selectedEmployee}
        />
      )}

      {showCreateUserModal && (
        <CreateUserModal
          isOpen={showCreateUserModal}
          onClose={() => {
            setShowCreateUserModal(false)
            setSelectedEmployee(null)
          }}
          employee={selectedEmployee}
          onSuccess={fetchEmployees}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => {
            setShowResetPasswordModal(false)
            setSelectedEmployee(null)
          }}
          employee={selectedEmployee}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  )
}