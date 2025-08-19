"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface QuickStatsProps {
  studentData?: {
    grades?: {
      gpa: number
      courses: any[]
    }
    attendance?: {
      rate: number
      absences: number
    }
  } | null
  gradebookError?: boolean
}

export function QuickStats({ studentData, gradebookError }: QuickStatsProps) {
  const calculateStats = () => {
    const stats = [
      {
        name: "Overall GPA",
        value: gradebookError ? "N/A" : "N/A",
        change: gradebookError ? "Gradebook disabled" : "Not available",
        changeType: "neutral" as const,
        icon: TrendingUp,
      },
      {
        name: "Attendance Rate",
        value: "N/A",
        change: "Calculating...",
        changeType: "neutral" as const,
        icon: CheckCircle,
      },
      {
        name: "Assignments Due",
        value: gradebookError ? "N/A" : "N/A",
        change: gradebookError ? "Gradebook disabled" : "Not available",
        changeType: "neutral" as const,
        icon: Clock,
      },
      {
        name: "Missing Assignments",
        value: gradebookError ? "N/A" : "N/A",
        change: gradebookError ? "Gradebook disabled" : "Not available",
        changeType: "neutral" as const,
        icon: AlertCircle,
      },
    ]

    if (studentData?.attendance?.rate !== undefined) {
      const rate = Math.round(studentData.attendance.rate)
      stats[1] = {
        ...stats[1],
        value: `${rate}%`,
        change: rate >= 95 ? "Excellent" : rate >= 90 ? "Good" : "Needs improvement",
        changeType: rate >= 95 ? "positive" : rate >= 90 ? "neutral" : "negative",
      }
    }

    return stats
  }

  const stats = calculateStats()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.name}
          className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:bg-card/70 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 animate-fade-in cursor-pointer group"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.name}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                {stat.value}
              </p>
              <p
                className={`text-xs transition-colors duration-200 ${
                  stat.changeType === "positive"
                    ? "text-green-500"
                    : stat.changeType === "negative"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {stat.change}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-200 group-hover:scale-110">
              <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
