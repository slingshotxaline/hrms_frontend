import { getStatusColor } from '@/lib/utils'

export default function Badge({ status, children }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {children || status}
    </span>
  )
}