'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '@/lib/api'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

export default function OfficeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [holidays, setHolidays] = useState([])
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const isHoliday = (date) => {
    return holidays.find(holiday => {
      const holidayDate = new Date(holiday.date)
      return holidayDate.toDateString() === date.toDateString()
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg p-6 border border-indigo-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Office Calendar</h2>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {monthName} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const weekend = isWeekend(date)
          const holiday = isHoliday(date)
          const today = isToday(date)

          return (
            <div
              key={date.toISOString()}
              className={`aspect-square p-1 relative group cursor-pointer transition-all ${
                today
                  ? 'bg-indigo-600 text-white rounded-lg shadow-lg scale-105'
                  : weekend
                  ? 'bg-red-50 hover:bg-red-100 rounded-lg'
                  : holiday
                  ? 'bg-purple-50 hover:bg-purple-100 rounded-lg'
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span
                  className={`text-sm font-semibold ${
                    today
                      ? 'text-white'
                      : weekend
                      ? 'text-red-600'
                      : holiday
                      ? 'text-purple-600'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </span>
                
                {/* Indicators */}
                <div className="flex gap-1 mt-1">
                  {weekend && !today && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Weekend" />
                  )}
                  {holiday && (
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" title="Holiday" />
                  )}
                </div>
              </div>

              {/* Tooltip */}
              {holiday && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                    <p className="font-semibold">{holiday.name}</p>
                    <p className="text-gray-300 mt-1">{holiday.type}</p>
                    {holiday.description && (
                      <p className="text-gray-400 mt-1 text-xs">{holiday.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
            <span className="text-gray-700">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
            <span className="text-gray-700">Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded"></div>
            <span className="text-gray-700">Holiday</span>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Upcoming Holidays</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {holidays
            .filter(h => new Date(h.date) >= new Date())
            .slice(0, 5)
            .map((holiday) => (
              <div
                key={holiday._id}
                className="flex items-start gap-3 p-2 bg-purple-50 rounded-lg border border-purple-100"
              >
                <CalendarIcon className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {holiday.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(holiday.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {holiday.isPaid && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    Paid
                  </span>
                )}
              </div>
            ))}
          {holidays.filter(h => new Date(h.date) >= new Date()).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No upcoming holidays
            </p>
          )}
        </div>
      </div>
    </div>
  )
}