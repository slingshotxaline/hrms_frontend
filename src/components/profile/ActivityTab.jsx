"use client";

import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import Loading from "@/components/common/Loading";
import Badge from "@/components/common/Badge";
import { Clock, Calendar, FileText, User } from "lucide-react";

export default function ActivityTab({ employeeId }) {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) fetchActivity();
  }, [employeeId]);

  const fetchActivity = async () => {
    try {
      const [attData, leaveData] = await Promise.all([
        apiCall(`/attendance?employeeId=${employeeId}`),
        apiCall(`/leaves?employeeId=${employeeId}`),
      ]);
      setAttendance(attData);
      setLeaves(leaveData);
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Combine and sort activities
  const activities = [
    ...attendance.map((a) => ({
      id: a._id,
      type: "attendance",
      date: a.date,
      status: a.status,
      inTime: a.inTime,
      outTime: a.outTime,
      lateMinutes: a.lateMinutes,
    })),
    ...leaves.map((l) => ({
      id: l._id,
      type: "leave",
      date: l.startDate,
      status: l.status,
      leaveType: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      reason: l.reason,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Summary Stats
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const thisMonthAttendance = attendance.filter((a) => {
    const d = new Date(a.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  const stats = {
    totalPresent: thisMonthAttendance.filter((a) => a.status === "Present")
      .length,
    totalAbsent: thisMonthAttendance.filter((a) => a.status === "Absent")
      .length,
    totalLeaves: leaves.filter((l) => l.status === "Approved").length,
    totalLate: thisMonthAttendance.filter((a) => a.lateMinutes > 0).length,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {stats.totalPresent}
          </p>
          <p className="text-xs text-gray-600 mt-1">Present</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.totalAbsent}</p>
          <p className="text-xs text-gray-600 mt-1">Absent</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalLeaves}
          </p>
          <p className="text-xs text-gray-600 mt-1">Leaves</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {stats.totalLate}
          </p>
          <p className="text-xs text-gray-600 mt-1">Late Days</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity found</p>
          </div>
        ) : (
          activities.slice(0, 30).map((activity, index) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="flex items-start gap-4"
            >
              {/* Timeline Dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full mt-1.5 ${
                    activity.type === "attendance"
                      ? activity.status === "Present"
                        ? "bg-green-500"
                        : "bg-red-500"
                      : activity.status === "Approved"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                />
                {index < activities.length - 1 && (
                  <div
                    className="w-0.5 h-full bg-gray-200 mt-1"
                    style={{ minHeight: "40px" }}
                  />
                )}
              </div>

              {/* Content Card */}
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 mb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {activity.type === "attendance" ? (
                      <Clock className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Calendar className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-semibold text-gray-900 text-sm">
                      {activity.type === "attendance"
                        ? "Attendance"
                        : "Leave Request"}
                    </span>
                  </div>
                  <Badge status={activity.status} />
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  {activity.type === "attendance" && (
                    <div className="flex gap-4 mt-2">
                      {activity.inTime && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          In:{" "}
                          {new Date(activity.inTime).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      )}
                      {activity.outTime && (
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                          Out:{" "}
                          {new Date(activity.outTime).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      )}
                      {activity.lateMinutes > 0 && (
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                          Late: {activity.lateMinutes} min
                        </span>
                      )}
                    </div>
                  )}

                  {activity.type === "leave" && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          Type:{" "}
                          {activity.leaveType === "CL"
                            ? "Casual"
                            : activity.leaveType === "SL"
                            ? "Sick"
                            : activity.leaveType === "EL"
                            ? "Earned"
                            : "Unpaid"}
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {new Date(activity.startDate).toLocaleDateString()} -{" "}
                          {new Date(activity.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
