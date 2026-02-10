import { useState } from 'react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { User, Mail, Edit, Save } from 'lucide-react'

export default function PersonalInfoTab({ profile, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(formData)
    setIsEditing(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-black">Personal Information</h3>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2 inline" />
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <Save className="w-4 h-4 mr-2 inline" />
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <InfoCard icon={User} label="Full Name" value={profile?.name} />
          <InfoCard icon={Mail} label="Email" value={profile?.email} />
          <InfoCard 
            icon={User} 
            label="Role" 
            value={profile?.role}
            badge={profile?.role}
          />
        </div>
      )}
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, badge }) {
  const badgeColors = {
    Admin: 'bg-red-100 text-red-800',
    HR: 'bg-blue-100 text-blue-800',
    Employee: 'bg-indigo-100 text-indigo-800',
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-black">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="font-semibold text-black">{value}</p>
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColors[badge] || ''}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}