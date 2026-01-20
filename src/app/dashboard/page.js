'use client';
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    // Initialize state from cookies on mount
    const userInfo = Cookies.get('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-black">Welcome back, {user?.name || 'User'}!</h2>
        <p className="text-gray-600">
          This is your HRMS dashboard overview. Navigate through the sidebar to manage employees, attendance, and payroll.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Total Employees</h3>
            <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Present Today</h3>
            <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Pending Leaves</h3>
            <p className="text-3xl font-bold mt-2">--</p>
        </div>
      </div>
    </div>
  );
}