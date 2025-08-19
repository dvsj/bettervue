"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { StudentVUEAPI } from "@/lib/studentvue-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfileCard } from "@/components/profile-card"
import { QuickStats } from "@/components/quick-stats"
import { RecentActivity } from "@/components/recent-activity"
import { NavigationGrid } from "@/components/navigation-grid"

export default function DashboardPage() {
  // im so tired
  const [user, setUser] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gradebookError, setGradebookError] = useState(false)
  const router = useRouter()

  // load all the data when the page mounts because why not
  useEffect(() => {
    const loadData = async () => {
      const authManager = AuthManager.getInstance()
      const currentUser = authManager.getUser()

      if (!currentUser) {
        router.push("/")
        return
      }

      setUser(currentUser)

      try {
        const api = new StudentVUEAPI(currentUser.id, currentUser.password || "")

        const [studentResponse, gradesResponse, attendanceResponse] = await Promise.all([
          api.getStudent(),
          api.getGrades(),
          api.getAttendance(),
        ])


        if (gradesResponse.error && gradesResponse.error.includes("Grade Book Module")) {
          setGradebookError(true)
        }

        const parsedData = {
          student: studentResponse.success ? api.parseStudentInfo(studentResponse.data) : null,
          grades: gradesResponse.success ? api.parseGrades(gradesResponse.data) : null,
          attendance: attendanceResponse.success ? api.parseAttendance(attendanceResponse.data) : null,
        }

        setStudentData(parsedData)
      } catch (error) {
      }

      setLoading(false)
      setMounted(true)
    }

    loadData()
  }, [router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading your data...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayUser = studentData?.student
    ? {
        ...user,
        ...studentData.student,
        photo: studentData.student.photo ? `data:image/png;base64,${studentData.student.photo}` : undefined,
      }
    : user

  return (
    <DashboardLayout>
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Welcome back, {displayUser.name.split(" ")[0]}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with school today.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            <QuickStats studentData={studentData} gradebookError={gradebookError} />
            <NavigationGrid />
            <div className="xl:hidden">
              <ProfileCard user={displayUser} />
            </div>
            <RecentActivity studentData={studentData} />
          </div>

          <div className="hidden xl:block space-y-6 lg:space-y-8">
            <ProfileCard user={displayUser} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
