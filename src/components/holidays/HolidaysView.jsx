'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import HolidayCard from './HolidayCard'
import HolidayModal from './HolidayModal'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { Plus, Calendar } from 'lucide-react'

export default function HolidaysView() {
  const { user } = useAuth()
  const [holidays, setHolidays] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHolidays()
  }, [])

  const fetchHolidays = async () => {
    try {
      const data = await apiCall('/holidays')
      setHolidays(data)
    } catch (error) {
      console.error('Error fetching holidays:', error)
    } finally {
      setLoading(false)
    }
  }

  const addHoliday = async (formData) => {
    try {
      await apiCall('/holidays', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      fetchHolidays()
      setShowAddModal(false)
      alert('Holiday added successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Holidays</h1>
        {(user.role === 'Admin' || user.role === 'HR') && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Holiday
          </Button>
        )}
      </div>

      {holidays.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-black mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">No Holidays Added</h3>
          <p className="text-black mb-6">Start by adding your first holiday</p>
          {(user.role === 'Admin' || user.role === 'HR') && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Holiday
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holidays.map((holiday) => (
            <HolidayCard key={holiday._id} holiday={holiday} />
          ))}
        </div>
      )}

      {showAddModal && (
        <HolidayModal
          onClose={() => setShowAddModal(false)}
          onSubmit={addHoliday}
        />
      )}
    </div>
  )
}