export default function StatsCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-black mb-2">{title}</h3>
      <p className="text-3xl font-bold text-black mb-2">{value}</p>
      
      {subtitle && (
        <p className="text-xs text-black">{subtitle}</p>
      )}
    </div>
  )
}