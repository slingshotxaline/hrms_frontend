export default function RecentActivity() {
    const activities = [
      { text: 'Attendance marked for today', color: 'bg-green-500' },
      { text: 'New employee added', color: 'bg-blue-500' },
      { text: 'Leave request pending', color: 'bg-orange-500' },
    ]
  
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
              <p className="text-sm text-black">{activity.text}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }