"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { StudentVUEAPI } from "@/lib/studentvue-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"

export default function CalendarPage() {
  const [calendarData, setCalendarData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const loadCalendar = async () => {
      const authManager = AuthManager.getInstance()
      const currentUser = authManager.getUser()

      if (!currentUser) {
        router.push("/")
        return
      }

      try {
        const api = new StudentVUEAPI(currentUser.id, currentUser.password || "")

        const response = await api.getCalendar()

        if (response.success && response.data) {
          const calendar = api.parseCalendar(response.data)
          setCalendarData(calendar)
        } else {
          setError("Calendar data is not available")
        }
      } catch (error) {
        setError("Failed to load calendar data")
      }

      setLoading(false)
    }

    loadCalendar()
  }, [router])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    if (!calendarData?.events) return []
    return calendarData.events.filter((event: any) => {
      if (!event.date) return false
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading calendar...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="text-muted-foreground">View upcoming events and important dates.</p>
        </div>

        {error || !calendarData ? (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Calendar Not Available</h3>
            <p className="text-muted-foreground">{error || "Calendar information is not accessible at this time."}</p>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                  <div key={`empty-${i}`} className="p-2 h-12" />
                ))}
                {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                  const day = i + 1
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  const events = getEventsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={day}
                      className={`p-2 h-12 border border-border/30 rounded-lg flex flex-col items-center justify-center text-sm relative ${
                        isToday ? "bg-primary/10 border-primary/30" : "hover:bg-background/50"
                      }`}
                    >
                      <span className={isToday ? "text-primary font-semibold" : "text-foreground"}>{day}</span>
                      {events.length > 0 && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
              {calendarData.events.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No upcoming events found.</p>
              ) : (
                <div className="grid gap-4">
                  {calendarData.events.slice(0, 10).map((event: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.date ? event.date.toLocaleDateString() : "Date TBA"}
                        </p>
                        {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                        {event.dayType && (
                          <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                            {event.dayType}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
