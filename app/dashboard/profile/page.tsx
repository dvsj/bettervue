"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { StudentVUEAPI } from "@/lib/studentvue-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { User, School, Calendar, Hash, Mail, Phone } from "lucide-react"

export default function ProfilePage() {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const authManager = AuthManager.getInstance()
      const currentUser = authManager.getUser()

      if (!currentUser) {
        router.push("/")
        return
      }

      try {
        const api = new StudentVUEAPI(currentUser.id, currentUser.password || "")
        const response = await api.getStudent()

        if (response.success) {
          const parsed = api.parseStudentInfo(response.data)
          setStudentData(parsed)
        }
      } catch (error) {
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading profile data...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
          <p className="text-muted-foreground">View your personal and academic information.</p>
        </div>

        {studentData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="text-center space-y-4">
                {studentData.photo ? (
                  <img
                    src={`data:image/png;base64,${studentData.photo}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{studentData.name}</h3>
                  <p className="text-muted-foreground">Student</p>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium text-foreground">{studentData.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <School className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-medium text-foreground">{studentData.school}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade Level</p>
                    <p className="font-medium text-foreground">Grade {studentData.grade}</p>
                  </div>
                </div>

                {studentData.counselor && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Counselor</p>
                      <p className="font-medium text-foreground">{studentData.counselor}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {(studentData.email || studentData.phone) && (
              <Card className="lg:col-span-3 p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentData.email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{studentData.email}</p>
                      </div>
                    </div>
                  )}

                  {studentData.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{studentData.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Profile Data</h3>
            <p className="text-muted-foreground">Unable to load profile information at this time.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
