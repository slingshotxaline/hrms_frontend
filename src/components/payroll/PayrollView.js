'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import Button from '@/components/common/Button'
import PayrollTable from './PayrollTable'
import GeneratePayrollModal from './GeneratePayrollModal'
import RegeneratePayrollModal from './RegeneratePayrollModal'
import PayrollDetailsModal from './PayrollDetailsModal'
import PayrollAdjustmentModal from './PayrollAdjustmentModal' // ✅ NEW
import { DollarSign, Plus, RefreshCw, Filter } from 'lucide-react'

export default function PayrollView() {
  const { user } = useAuth()
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false) // ✅ NEW
  const [selectedPayroll, setSelectedPayroll] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('')

  const isAdmin = user?.role === 'Admin'
  const isHR = user?.role === 'HR'
  const canManage = isAdmin || isHR

  useEffect(() => {
    fetchPayrolls()
  }, [filterStatus, filterMonth])

  const fetchPayrolls = async () => {
    setLoading(true)
    try {
      let query = ''
      
      if (filterMonth) {
        const [year, month] = filterMonth.split('-')
        query = `?month=${month}&year=${year}`
      }
      
      if (filterStatus !== 'all') {
        query += (query ? '&' : '?') + `status=${filterStatus}`
      }

      const data = await apiCall(`/payroll${query}`)
      console.log('✅ Payrolls loaded:', data.length)
      setPayrolls(data)
    } catch (error) {
      console.error('❌ Error fetching payrolls:', error)
      alert('Error loading payrolls: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (payroll) => {
    setSelectedPayroll(payroll)
    setShowDetailsModal(true)
  }

  const handleRegenerateSingle = (payroll) => {
    setSelectedPayroll(payroll)
    setShowRegenerateModal(true)
  }

  // ✅ NEW: Handle adjustment
  const handleAddAdjustment = (payroll) => {
    setSelectedPayroll(payroll)
    setShowAdjustmentModal(true)
  }

  if (loading) return <Loading />

  const uniqueMonths = [...new Set(payrolls.map(p => 
    new Date(p.month).toISOString().slice(0, 7)
  ))].sort().reverse()

  const stats = {
    total: payrolls.length,
    pending: payrolls.filter(p => p.status === 'Pending').length,
    approved: payrolls.filter(p => p.status === 'Approved').length,
    paid: payrolls.filter(p => p.status === 'Paid').length,
    regenerated: payrolls.filter(p => p.isRegenerated).length,
    totalAmount: payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0),
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">
            Manage employee payroll and salary processing
          </p>
        </div>
        {canManage && (
          <div className="flex gap-3">
            {payrolls.length > 0 && (
              <Button 
                onClick={() => setShowRegenerateModal(true)}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Regenerate All
              </Button>
            )}
            <Button onClick={() => setShowGenerateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Generate Payroll
            </Button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <StatCard label="Total Records" value={stats.total} color="bg-blue-500" icon={DollarSign} />
        <StatCard label="Pending" value={stats.pending} color="bg-yellow-500" icon={DollarSign} />
        <StatCard label="Approved" value={stats.approved} color="bg-green-500" icon={DollarSign} />
        <StatCard label="Paid" value={stats.paid} color="bg-purple-500" icon={DollarSign} />
        <StatCard label="Regenerated" value={stats.regenerated} color="bg-orange-500" icon={RefreshCw} />
        <StatCard 
          label="Total Amount" 
          value={`৳${(stats.totalAmount / 1000000).toFixed(2)}M`} 
          color="bg-indigo-500" 
          icon={DollarSign} 
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-600" />
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <div className="flex gap-2">
              <FilterButton 
                active={filterStatus === 'all'} 
                onClick={() => setFilterStatus('all')}
                label="All"
              />
              <FilterButton 
                active={filterStatus === 'Pending'} 
                onClick={() => setFilterStatus('Pending')}
                label="Pending"
                color="yellow"
              />
              <FilterButton 
                active={filterStatus === 'Approved'} 
                onClick={() => setFilterStatus('Approved')}
                label="Approved"
                color="green"
              />
              <FilterButton 
                active={filterStatus === 'Paid'} 
                onClick={() => setFilterStatus('Paid')}
                label="Paid"
                color="purple"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <PayrollTable
        payrolls={payrolls}
        onViewDetails={handleViewDetails}
        onRegenerate={canManage ? handleRegenerateSingle : null}
        onAddAdjustment={canManage ? handleAddAdjustment : null} // ✅ NEW
        canManage={canManage}
      />

      {/* Modals */}
      {showGenerateModal && (
        <GeneratePayrollModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={fetchPayrolls}
        />
      )}

      {showRegenerateModal && (
        <RegeneratePayrollModal
          onClose={() => {
            setShowRegenerateModal(false)
            setSelectedPayroll(null)
          }}
          onSuccess={fetchPayrolls}
          payroll={selectedPayroll}
          selectedMonth={filterMonth}
        />
      )}

      {showDetailsModal && selectedPayroll && (
        <PayrollDetailsModal
          payroll={selectedPayroll}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedPayroll(null)
          }}
        />
      )}

      {/* ✅ NEW: Adjustment Modal */}
      {showAdjustmentModal && selectedPayroll && (
        <PayrollAdjustmentModal
          payroll={selectedPayroll}
          onClose={() => {
            setShowAdjustmentModal(false)
            setSelectedPayroll(null)
          }}
          onSuccess={fetchPayrolls}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function FilterButton({ active, onClick, label, color = 'indigo' }) {
  const colors = {
    indigo: active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    green: active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    purple: active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colors[color]}`}
    >
      {label}
    </button>
  )
}