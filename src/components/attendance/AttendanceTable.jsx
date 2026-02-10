import { useState } from "react";
import Badge from "@/components/common/Badge";
import { formatTime } from "@/lib/utils";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Coffee,
  Calendar,
} from "lucide-react";
import PunchDetailsModal from "./PunchDetailsModal";

export default function AttendanceTable({
  attendance,
  showEmployeeColumn = false,
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPunchModal, setShowPunchModal] = useState(false);

  // Helper function to get timing badge (IN time)
  const getTimingBadge = (record) => {
    // ✅ Check if it's off-day work first
    if (record.isOffDayWork || record.timingStatus === "Off-Day Overtime") {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border-2 border-purple-300">
            🎉 Off-Day Work
          </span>
          <span className="text-xs text-purple-600 mt-1 font-semibold">
            Full Day Overtime
          </span>
        </div>
      );
    }

    if (record.isEarly) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Early
          </span>
          <span className="text-xs text-black mt-1">
            {record.earlyMinutes} min early
          </span>
        </div>
      );
    }

    if (record.timingStatus === "On Time (Grace)" || record.usedGracePeriod) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            On Time
          </span>
          <span className="text-xs text-amber-600 mt-1">Used grace period</span>
        </div>
      );
    }

    if (record.timingStatus === "On Time" && record.lateMinutes === 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          On Time
        </span>
      );
    }

    if (record.isHalfDay) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Half Day
          </span>
          <span className="text-xs text-black mt-1">After 12:00 PM</span>
        </div>
      );
    }

    if (record.timingStatus === "Late" || record.lateMinutes > 0) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            Late
          </span>
          <span className="text-xs text-black mt-1">
            {record.lateMinutes} min late
          </span>
        </div>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-black">
        -
      </span>
    );
  };

  // Helper function to get overtime/early leave badge (OUT time)
  const getOvertimeBadge = (record) => {
    if (!record.outTime) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-black">
          Not punched out
        </span>
      );
    }

    // ✅ Off-Day Work - Show total working time as overtime
    if (record.isOffDayWork || record.timingStatus === "Off-Day Overtime") {
      const overtimeHours = ((record.overtimeMinutes || 0) / 60).toFixed(1);
      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1 border-2 border-purple-300">
              <TrendingUp className="w-3 h-3" />
              Full Day OT
            </span>
          </div>
          <span className="text-xs text-purple-600 mt-1 font-bold">
            +{record.overtimeMinutes} min ({overtimeHours}h)
          </span>
        </div>
      );
    }

    if (record.hasOvertime && record.overtimeMinutes > 0) {
      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Overtime
            </span>
          </div>
          <span className="text-xs text-purple-600 mt-1 font-semibold">
            +{record.overtimeMinutes} min
          </span>
        </div>
      );
    }

    if (record.earlyLeave && record.earlyLeaveMinutes > 0) {
      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Early Leave
            </span>
          </div>
          <span className="text-xs text-red-600 mt-1 font-semibold">
            -{record.earlyLeaveMinutes} min
          </span>
        </div>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        On Time
      </span>
    );
  };

  const handleViewPunches = (record) => {
    console.log("Opening punch details for:", record);
    setSelectedRecord(record);
    setShowPunchModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {showEmployeeColumn && (
                  <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                    Employee
                  </th>
                )}
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  Day
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  In Time
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  Out Time
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  <div className="flex flex-col">
                    <span>Total Hours</span>
                    <span className="text-xs text-black font-normal">
                      Gross
                    </span>
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  <div className="flex flex-col">
                    <span>Working</span>
                    <span className="text-xs text-black font-normal">
                      Net
                    </span>
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  <div className="flex flex-col">
                    <span>Breaks</span>
                    <span className="text-xs text-black font-normal">
                      Total
                    </span>
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  <div className="flex flex-col">
                    <span>In Timing</span>
                    <span className="text-xs text-black font-normal">
                      Arrival
                    </span>
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  <div className="flex flex-col">
                    <span>Out Timing</span>
                    <span className="text-xs text-black font-normal">
                      Departure
                    </span>
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-black uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={showEmployeeColumn ? 12 : 11}
                    className="px-4 py-12 text-center text-black"
                  >
                    No attendance records found for this period
                  </td>
                </tr>
              ) : (
                attendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record) => {
                    const date = new Date(record.date);
                    const dayName = date.toLocaleDateString("en-US", {
                      weekday: "short",
                    });

                    let grossHours = 0;
                    if (record.inTime && record.outTime) {
                      grossHours =
                        (new Date(record.outTime) - new Date(record.inTime)) /
                        (1000 * 60 * 60);
                    }

                    const netHours = (record.netWorkingMinutes || 0) / 60;
                    const breakHours = (record.totalBreakMinutes || 0) / 60;
                    const punchCount = record.punches?.length || 0;

                    // ✅ Check if it's weekend or off-day
                    const isWeekendDay = dayName === "Fri" || dayName === "Sat";
                    const isOffDay = record.isOffDay || record.isOffDayWork;

                    return (
                      <tr
                        key={record._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isOffDay ? "bg-purple-50" : ""
                        }`}
                      >
                        {showEmployeeColumn && (
                          <td className="px-4 py-4 text-xs font-medium text-black">
                            <div>
                              <p>
                                {record.employee?.firstName}{" "}
                                {record.employee?.lastName}
                              </p>
                              <p className="text-xs text-black">
                                {record.employee?.employeeCode}
                              </p>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-4 text-xs text-black">
                          <div className="flex items-center gap-2">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {isOffDay && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-semibold">
                                Off-Day
                              </span>
                            )}
                          </div>
                        </td>
                        {/* <td className="px-4 py-4 text-xs text-black">
                          <div className="flex items-center gap-2">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {isOffDay && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-semibold">
                                Off-Day
                              </span>
                            )}
                          </div>
                        </td> */}
                        <td className="px-4 py-4 text-xs">
                          <span
                            className={`font-semibold ${
                              isWeekendDay ? "text-red-600" : "text-black"
                            }`}
                          >
                            {dayName}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-black">
                          {record.inTime ? (
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {formatTime(record.inTime)}
                              </span>
                              {punchCount > 1 && (
                                <span className="text-xs text-blue-600">
                                  First punch
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs text-black">
                          {record.outTime ? (
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {formatTime(record.outTime)}
                              </span>
                              {punchCount > 1 && (
                                <span className="text-xs text-blue-600">
                                  Last punch
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {grossHours > 0 ? (
                            <span
                              className={`font-semibold ${
                                isOffDay ? "text-purple-600" : "text-indigo-600"
                              }`}
                            >
                              {grossHours.toFixed(1)}h
                            </span>
                          ) : (
                            <span className="text-black">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {netHours > 0 ? (
                            <span
                              className={`font-semibold ${
                                isOffDay ? "text-purple-600" : "text-green-600"
                              }`}
                            >
                              {netHours.toFixed(1)}h
                            </span>
                          ) : (
                            <span className="text-black">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {breakHours > 0 ? (
                            <div className="flex items-center gap-1">
                              <Coffee className="w-3 h-3 text-amber-600" />
                              <span className="font-semibold text-amber-600">
                                {breakHours.toFixed(1)}h
                              </span>
                            </div>
                          ) : (
                            <span className="text-black">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          <Badge status={record.status} />
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {getTimingBadge(record)}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {getOvertimeBadge(record)}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          <button
                            onClick={() => handleViewPunches(record)}
                            className="flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-semibold">
                              {punchCount}{" "}
                              {punchCount === 1 ? "punch" : "punches"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPunchModal && selectedRecord && (
        <PunchDetailsModal
          isOpen={showPunchModal}
          record={selectedRecord}
          onClose={() => {
            console.log("Closing modal");
            setShowPunchModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </>
  );
}
