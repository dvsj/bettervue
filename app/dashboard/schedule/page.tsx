"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { StudentVUEAPI } from "@/lib/studentvue-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, User, MapPin, ChevronDown } from "lucide-react"

export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [termList, setTermList] = useState<any[]>([])
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTermDropdown, setShowTermDropdown] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadTerms = async () => {
      const authManager = AuthManager.getInstance()
      const currentUser = authManager.getUser()

      if (!currentUser) {
        router.push("/")
        return
      }

      try {
        const api = new StudentVUEAPI(currentUser.id, currentUser.password || "")

        const termResponse = await api.getTermList()

        if (termResponse.success && termResponse.data) {
          const terms = api.parseTermList(termResponse.data)
          setTermList(terms)

          if (terms.length > 0) {
            const firstTerm = terms[0]
            setSelectedTerm(firstTerm.index)
            await loadScheduleForTerm(api, firstTerm.index)
          } else {
            await loadScheduleForTerm(api, null)
          }
        } else {
          await loadScheduleForTerm(api, null)
        }
      } catch (error) {

        setError("Failed to load schedule data")
        setLoading(false)
      }
    }

    loadTerms()
  }, [router])

  const loadScheduleForTerm = async (api: StudentVUEAPI, termIndex: number | null) => {
    try {
  const scheduleResponse = await api.getClassSchedule(termIndex === null ? undefined : termIndex)

      if (scheduleResponse.success && scheduleResponse.data) {
  const schedule = api.parseClassSchedule(scheduleResponse.data)
  setScheduleData(schedule)
  setError(null)
      } else {
        setError("Schedule data is not available for this term")
      }
    } catch (error) {
      setError("Failed to load schedule data")
    }

    setLoading(false)
  }

  const handleTermChange = async (termIndex: number) => {
    setSelectedTerm(termIndex)
    setShowTermDropdown(false)
    setLoading(true)

    const authManager = AuthManager.getInstance()
    const currentUser = authManager.getUser()

    if (currentUser) {
      const api = new StudentVUEAPI(currentUser.id, currentUser.password || "")
      await loadScheduleForTerm(api, termIndex)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading schedule...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const selectedTermData = termList.find((term) => term.index === selectedTerm)

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule</h1>
          <p className="text-muted-foreground">View your daily class schedule.</p>
        </div>

        {termList.length > 1 && (
          <>
            {/* Dropdown for selecting the term to view schedule */}
            <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowTermDropdown(!showTermDropdown)}
              className="w-full sm:w-auto justify-between min-w-[200px]"
            >
              {selectedTermData ? selectedTermData.name : "Select Term"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>

            {showTermDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full sm:w-auto min-w-[200px] bg-card border border-border rounded-md shadow-lg z-10">
                {termList.map((term) => (
                  <button
                    key={term.index}
                    onClick={() => handleTermChange(term.index)}
                    className={`w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground ${
                      selectedTerm === term.index ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    {term.name}
                  </button>
                ))}
              </div>
            )}
            </div>
          </>
        )}

        {error || !scheduleData ? (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Schedule Not Available</h3>
            <p className="text-muted-foreground">{error || "Schedule information is not accessible at this time."}</p>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-xl font-semibold text-foreground mb-4">{scheduleData.termName}</h2>
              <div className="grid gap-4">
                {(scheduleData.classList || scheduleData.classes) &&
                (scheduleData.classList || scheduleData.classes).length > 0 ? (
                  (scheduleData.classList || scheduleData.classes).map((cls: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary">Period {cls.period}</span>
                          <span className="text-lg font-semibold text-foreground">{cls.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {cls.teacher || "TBA"}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {cls.room || "TBA"}
                          </div>
                          {cls.email && (
                            <a href={`mailto:${cls.email}`} className="text-primary hover:underline">
                              Email Teacher
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No classes found for this term.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
