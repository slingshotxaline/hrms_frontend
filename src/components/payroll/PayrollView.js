'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '@/lib/api'
import PayrollTable from './PayrollTable'
import PayrollFilters from './PayrollFilters'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { DollarSign } from 'lucide-react'

export default function PayrollView() {
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  const fetchData = async () => {
    try {
      const [payrollData, employeesData] = await Promise.all([
        apiCall(`/payroll?month=${selectedMonth}&year=${selectedYear}`),
        apiCall('/employees'),
      ])
      setPayrolls(payrollData)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching payroll:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePayroll = async () => {
    try {
      const confirmGenerate = window.confirm(
        `Are you sure you want to generate payroll for ${getMonthName(selectedMonth)} ${selectedYear}?`
      )
      
      if (!confirmGenerate) return

      await apiCall('/payroll/generate', {
        method: 'POST',
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      })
      fetchData()
      alert('Payroll generated successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  const getMonthName = (month) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' })
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <Button onClick={generatePayroll}>
          <DollarSign className="w-5 h-5 mr-2 inline" />
          Generate Payroll
        </Button>
      </div>

      <PayrollFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
      />

      <PayrollTable payrolls={payrolls} />

      {payrolls.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payroll Records</h3>
          <p className="text-gray-600 mb-6">
            No payroll has been generated for {getMonthName(selectedMonth)} {selectedYear}
          </p>
          <Button onClick={generatePayroll}>
            Generate Payroll Now
          </Button>
        </div>
      )}
    </div>
  )
}