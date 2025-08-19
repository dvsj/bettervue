"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Calendar, CheckCircle } from "lucide-react"

interface RecentActivityProps {
  studentData?: {
    grades?: {
      courses: Array<{
        name: string
        grade: string
        rawScore: number
      }>
    }
    attendance?: {
      recentAbsences: Array<{
        date: string
        reason: string
      }>
    }
  } | null
}

export function RecentActivity({ studentData }: RecentActivityProps) {
  const generateActivities = () => {
    if (!studentData || (!studentData.grades?.courses && !studentData.attendance?.recentAbsences)) {
      return [
        {
          type: "info",
          title: "No recent activity",
          description: "Check back later for updates",
          time: "",
          icon: Clock,
        },
      ]
    }

    const activities = []

    if (studentData.grades?.courses) {
      const recentCourses = studentData.grades.courses.slice(0, 2)
      recentCourses.forEach((course) => {
        if (course.grade !== "N/A") {
          activities.push({
            type: "grade",
            title: "Grade updated",
            description: `${course.name}`,
            grade: course.grade,
            time: "Recently",
            icon: BookOpen,
          })
        }
      })
    }

    if (studentData.attendance?.recentAbsences) {
      studentData.attendance.recentAbsences.slice(0, 2).forEach((absence) => {
        activities.push({
          type: "attendance",
          title: "Absence recorded",
          description: absence.reason,
          time: new Date(absence.date).toLocaleDateString(),
          icon: Calendar,
        })
      })
    }

    if (activities.length === 0) {
      activities.push({
        type: "info",
        title: "No recent activity",
        description: "All caught up!",
        time: "",
        icon: CheckCircle,
      })
    }

    return activities
  }

  const activities = generateActivities()

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">Recent Activity</h2>
      <Card className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="space-y-2 lg:space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 animate-fade-in cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all duration-200 group-hover:scale-110 flex-shrink-0">
                <activity.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm sm:text-base text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                    {activity.title}
                  </h4>
                  {activity.grade && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-200 text-xs flex-shrink-0"
                    >
                      {activity.grade}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
