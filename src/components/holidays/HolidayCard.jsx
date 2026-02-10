import { Calendar } from 'lucide-react'

export default function HolidayCard({ holiday }) {
  const getTypeColor = (type) => {
    const colors = {
      Government: 'bg-blue-100 text-blue-800',
      Religious: 'bg-purple-100 text-purple-800',
      Company: 'bg-green-100 text-green-800',
    }
    return colors[type] || 'bg-gray-100 text-black'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-black mb-1">{holiday.name}</h3>
          <p className="text-sm text-black">{formatDate(holiday.date)}</p>
        </div>
        <Calendar className="w-6 h-6 text-indigo-600 flex-shrink-0" />
      </div>
      
      <div className="space-y-2">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(holiday.type)}`}>
          {holiday.type}
        </span>
        
        {holiday.isPaid && (
          <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Paid
          </span>
        )}
        
        {holiday.description && (
          <p className="text-sm text-black mt-3 pt-3 border-t">{holiday.description}</p>
        )}
      </div>
    </div>
  )
}