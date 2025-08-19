"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, Activity, Heart, User, ChevronRight } from "lucide-react"

export function NavigationGrid() {
  const router = useRouter()

  const navigationItems = [
    {
      name: "View Grades",
      description: "Check your current grades and assignments",
      href: "/dashboard/grades",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Class Schedule",
      description: "View your daily class schedule",
      href: "/dashboard/schedule",
      icon: Clock,
      color: "from-green-500 to-green-600",
    },
    {
      name: "Calendar",
      description: "See upcoming events and important dates",
      href: "/dashboard/calendar",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Attendance",
      description: "Track your attendance record",
      href: "/dashboard/attendance",
      icon: Activity,
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "Health Records",
      description: "View immunizations and health information",
      href: "/dashboard/health",
      icon: Heart,
      color: "from-red-500 to-red-600",
    },
    {
      name: "Profile",
      description: "View your personal information",
      href: "/dashboard/profile",
      icon: User,
      color: "from-indigo-500 to-indigo-600",
    },
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {navigationItems.map((item, index) => (
          <Card
            key={item.name}
            className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:bg-card/70 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 cursor-pointer group animate-fade-in active:scale-[0.98]"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => router.push(item.href)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors duration-200">
                    {item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
