"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { StudentVUEAPI } from "@/lib/studentvue-api"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function GradesPage() {
  const [grades, setGrades] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadGrades = async () => {
      const authManager = AuthManager.getInstance()
      const user = authManager.getUser()

      if (!user) {
        router.push("/")
        return
      }

      try {
        const api = new StudentVUEAPI(user.id, user.password || "")
        const response = await api.getGrades()

        if (response.success) {
          const parsedGrades = api.parseGrades(response.data)
          setGrades(parsedGrades)
        }
      } catch (error) {
      }

      setLoading(false)
    }

    loadGrades()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Grades</h1>
          <p className="text-muted-foreground">View your current grades and assignments.</p>
        </div>

        {grades ? (
          <div className="space-y-6">
            {/* display current gpa and report period hopefully */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Current GPA: {grades.gpa}</h2>
              <p className="text-muted-foreground">{grades.reportPeriod}</p>
            </div>

            <div className="grid gap-4">
              {grades.courses.map((course, index) => (
                <div key={index} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Period {course.period} • {course.teacher}
                      </p>
                      {course.room && <p className="text-sm text-muted-foreground">Room {course.room}</p>}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{course.grade}</div>
                      <div className="text-sm text-muted-foreground">{course.rawScore.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">No Grades Available</h2>
            <p className="text-muted-foreground">Unable to load grade information at this time.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
