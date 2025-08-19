"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { StudentVUEAPI } from "@/lib/studentvue-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadAttendance = async () => {
      const authManager = AuthManager.getInstance()
      const currentUser = authManager.getUser()

      if (!currentUser) {
        router.push("/")
        return
      }

      try {
        const api = new StudentVUEAPI(currentUser.id, currentUser.password || "")
        const response = await api.getAttendance()

        if (response.success) {
          const parsed = api.parseAttendance(response.data)
          setAttendanceData(parsed)
        }
      } catch (error) {
      }

      setLoading(false)
    }

    loadAttendance()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading attendance data...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Track your attendance record and view detailed information.</p>
        </div>

        {attendanceData ? (
          <div className="space-y-6">
            {/* attendance summary cards show rate, days present, and absences */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-2xl font-bold text-foreground">{Math.round(attendanceData.rate)}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Present</p>
                    <p className="text-2xl font-bold text-foreground">{attendanceData.daysPresent || "N/A"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Absences</p>
                    <p className="text-2xl font-bold text-foreground">{attendanceData.absences || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Attendance</h3>
              {attendanceData.records && attendanceData.records.length > 0 ? (
                <div className="space-y-3">
                  {attendanceData.records.slice(0, 10).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1 rounded-full ${record.status === "Present" ? "bg-green-500" : "bg-red-500"}`}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{record.date}</p>
                          <p className="text-sm text-muted-foreground">{record.period || "Full Day"}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === "Present" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent attendance records available.</p>
              )}
            </Card>
          </div>
        ) : (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Attendance Data</h3>
            <p className="text-muted-foreground">Unable to load attendance information at this time.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
