'use client'

import { Users, Mail, Phone, Briefcase, Building2, Calendar } from 'lucide-react'

export default function MyTeamSection({ manages, role }) {
  if (!manages || manages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          My Team
        </h2>
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-black mx-auto mb-3" />
          <p className="text-black">No team members assigned yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black flex items-center gap-2">
          <Users className="w-5 h-5" />
          My Team
        </h2>
        <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">
          {manages.length} {manages.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {manages.map((member) => (
          <TeamMemberCard key={member._id} member={member} />
        ))}
      </div>
    </div>
  )
}

function TeamMemberCard({ member }) {
  const roleColors = {
    'Admin': 'bg-red-100 text-red-800 border-red-200',
    'HR': 'bg-blue-100 text-blue-800 border-blue-200',
    'Business Lead': 'bg-purple-100 text-purple-800 border-purple-200',
    'Team Lead': 'bg-green-100 text-green-800 border-green-200',
    'Employee': 'bg-gray-100 text-black border-gray-200',
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border-2 border-gray-200 hover:shadow-lg transition-all hover:scale-105">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
          {member.name?.charAt(0) || '?'}
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Role */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-black truncate">
              {member.name}
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 border ${roleColors[member.role] || 'bg-gray-100 text-black'}`}>
              {member.role}
            </span>
          </div>

          {/* Employee Details */}
          {member.employeeId && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-black flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-black">Employee Code</p>
                  <p className="font-semibold text-black truncate">
                    {member.employeeId.employeeCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-black flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-black">Department</p>
                  <p className="font-semibold text-black truncate">
                    {member.employeeId.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-black flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-black">Designation</p>
                  <p className="font-semibold text-black truncate">
                    {member.employeeId.designation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-black flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-black">Email</p>
                  <p className="font-semibold text-black truncate break-all">
                    {member.email}
                  </p>
                </div>
              </div>

              {member.employeeId.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-black flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-black">Phone</p>
                    <p className="font-semibold text-black truncate">
                      {member.employeeId.phone}
                    </p>
                  </div>
                </div>
              )}

              {member.employeeId.dateOfJoining && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-black flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-black">Joined</p>
                    <p className="font-semibold text-black truncate">
                      {new Date(member.employeeId.dateOfJoining).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}