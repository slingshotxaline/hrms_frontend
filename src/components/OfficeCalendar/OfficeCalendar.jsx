"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { apiCall } from "@/lib/api";
import QuickActionsModal from "../dashboard/QuickActionsModal";

export default function OfficeCalendar({ userRole }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, [currentDate]);

  const fetchHolidays = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const startDate = new Date(year, month - 1, 1)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const holidaysData = await apiCall(
        `/holidays?startDate=${startDate}&endDate=${endDate}`
      );
      setHolidays(holidaysData);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
  };

  const isHoliday = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    date.setHours(0, 0, 0, 0);

    return holidays.some((holiday) => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === date.getTime();
    });
  };

  const getHolidayName = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    date.setHours(0, 0, 0, 0);

    const holiday = holidays.find((h) => {
      const holidayDate = new Date(h.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === date.getTime();
    });

    return holiday?.name || "";
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
    setShowQuickActions(true);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-20"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const today = isToday(day);
    const weekend = isWeekend(day);
    const holiday = isHoliday(day);
    const holidayName = getHolidayName(day);

    days.push(
      <button
        key={day}
        onClick={() => handleDayClick(day)} // ✅ ADD THIS
        className={`h-20 p-2 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105 ${
          today
            ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-lg"
            : holiday
            ? "bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200"
            : weekend
            ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
        }`}
      >
        <div className="flex flex-col h-full">
          <span
            className={`text-sm font-semibold ${today ? "text-white" : ""}`}
          >
            {day}
          </span>
          {holiday && (
            <span className="text-xs mt-1 truncate text-purple-700 font-medium">
              {holidayName}
            </span>
          )}
          {weekend && !holiday && (
            <span className="text-xs mt-1 text-red-600 font-medium">
              Weekend
            </span>
          )}
          {today && (
            <span className="text-xs mt-auto bg-white/20 rounded px-1 py-0.5">
              Today
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Office Calendar
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">{days}</div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
            <span className="text-gray-600">Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
            <span className="text-gray-600">Holiday</span>
          </div>
        </div>

        {/* Click hint */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Tip:</strong> Click on any day to see quick actions
          </p>
        </div>
      </div>

      {/* Quick Actions Modal */}
      <QuickActionsModal
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        selectedDate={selectedDate}
        userRole={userRole}
      />
    </>
  );
}
