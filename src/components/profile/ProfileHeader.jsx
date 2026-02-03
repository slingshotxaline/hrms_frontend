export default function ProfileHeader({ profile, employee }) {
    const roleColors = {
      Admin: 'from-red-500 to-orange-500',
      HR: 'from-blue-500 to-cyan-500',
      'Business Lead': 'from-purple-500 to-pink-500',
      'Team Lead': 'from-green-500 to-emerald-500',
      Employee: 'from-indigo-500 to-purple-500',
    }
  
    const roleLabels = {
      Admin: 'System Administrator',
      HR: 'Human Resources Manager',
      'Business Lead': 'Business Lead',
      'Team Lead': 'Team Lead',
      Employee: 'Team Member',
    }
  
    return (
      <div className={`bg-gradient-to-r ${roleColors[profile?.role] || 'from-gray-500 to-gray-600'} rounded-xl shadow-lg p-8 mb-6 text-white`}>
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40">
            <span className="text-4xl font-bold text-white">
              {profile?.name?.charAt(0)}
            </span>
          </div>
  
          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile?.name}</h1>
            <p className="text-white/80 mt-1">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold">
                {roleLabels[profile?.role]}
              </span>
              {employee && (
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold">
                  {employee.employeeCode}
                </span>
              )}
              {employee && (
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold">
                  {employee.department}
                </span>
              )}
              {/* ✅ Reports To Badge */}
              {profile?.reportsTo && (
                <span className="px-4 py-1.5 bg-white/30 rounded-full text-sm font-semibold border border-white/40">
                  Reports To: {profile.reportsTo.name} ({profile.reportsTo.role})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }