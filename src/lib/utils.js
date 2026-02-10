export const formatDate = (date) => {
  if (!date) return '-';
  
  // ✅ Format date in Bangladesh timezone
  return new Date(date).toLocaleDateString('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  if (!date) return '-';
  
  // ✅ Format time in Bangladesh timezone
  return new Date(date).toLocaleTimeString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  
  // ✅ Format full datetime in Bangladesh timezone
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const getStatusColor = (status) => {
  const colors = {
    Present: 'bg-green-100 text-green-800',
    Absent: 'bg-red-100 text-red-800',
    Leave: 'bg-blue-100 text-blue-800',
    Holiday: 'bg-purple-100 text-purple-800',
    Weekend: 'bg-gray-100 text-black',
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Draft: 'bg-gray-100 text-black',
    Generated: 'bg-blue-100 text-blue-800',
    Paid: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-black'
}