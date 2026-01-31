import { ChevronDown, ChevronRight, Crown, Users, Briefcase, UserCheck } from 'lucide-react'
import { useState } from 'react'

export default function HierarchyTree({ hierarchy }) {
  return (
    <div className="space-y-4">
      {hierarchy.map(node => (
        <TreeNode key={node._id} node={node} level={0} />
      ))}
    </div>
  )
}

function TreeNode({ node, level }) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels

  const roleIcons = {
    'Admin': Crown,
    'HR': Users,
    'Business Lead': Briefcase,
    'Team Lead': UserCheck,
    'Employee': Users,
  }

  const roleColors = {
    'Admin': 'from-red-500 to-orange-500',
    'HR': 'from-blue-500 to-cyan-500',
    'Business Lead': 'from-purple-500 to-pink-500',
    'Team Lead': 'from-green-500 to-emerald-500',
    'Employee': 'from-gray-500 to-gray-600',
  }

  const RoleIcon = roleIcons[node.role] || Users
  const hasSubordinates = node.subordinates && node.subordinates.length > 0

  return (
    <div style={{ marginLeft: `${level * 24}px` }}>
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${roleColors[node.role]} text-white shadow-lg mb-2`}>
        {hasSubordinates && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-white/20 rounded p-1 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <RoleIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold">{node.name}</h3>
          <p className="text-sm text-white/80">{node.email}</p>
          {node.employeeId && (
            <p className="text-xs text-white/70 mt-1">
              {node.employeeId.employeeCode} • {node.employeeId.department}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-xs text-white/80">Role</p>
          <p className="font-semibold">{node.role}</p>
          {hasSubordinates && (
            <p className="text-xs text-white/70 mt-1">{node.subordinates.length} subordinates</p>
          )}
        </div>
      </div>

      {isExpanded && hasSubordinates && (
        <div className="border-l-2 border-gray-300 ml-6 pl-2">
          {node.subordinates.map(sub => (
            <TreeNode key={sub._id} node={sub} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}