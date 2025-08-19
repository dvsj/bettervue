"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { StudentVUEAPI } from "@/lib/studentvue-api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Heart, Shield, CheckCircle, XCircle } from "lucide-react"

export default function HealthPage() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadHealth = async () => {
      const authManager = AuthManager.getInstance()
      const currentUser = authManager.getUser()

      if (!currentUser) {
        router.push("/")
        return
      }

      try {
        const api = new StudentVUEAPI(currentUser.id, currentUser.password || "")

        const response = await api.getHealthInfo()

        if (response.success && response.data) {
          const health = api.parseHealthInfo(response.data)
          setHealthData(health)
        } else {
          setError("Health data is not available")
        }
      } catch (error) {
        setError("Failed to load health records")
      }

      setLoading(false)
    }

    loadHealth()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading health records...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Health Records</h1>
          <p className="text-muted-foreground">View immunizations and health information.</p>
        </div>

        {error || !healthData ? (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Health Records Not Available</h3>
            <p className="text-muted-foreground">{error || "Health information is not accessible at this time."}</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {healthData.healthConditions && healthData.healthConditions.length > 0 && (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Conditions
                </h2>
                <div className="grid gap-4">
                  {healthData.healthConditions.map((condition: any, index: number) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <h3 className="font-semibold text-foreground mb-2">{condition.condition}</h3>
                      {condition.comment && <p className="text-sm text-muted-foreground mb-2">{condition.comment}</p>}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {condition.startDate && <span>Start: {condition.startDate.toLocaleDateString()}</span>}
                        {condition.endDate && <span>End: {condition.endDate.toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {healthData.healthImmunizations && healthData.healthImmunizations.length > 0 && (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Immunizations
                </h2>
                <div className="grid gap-4">
                  {healthData.healthImmunizations.map((immunization: any, index: number) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{immunization.name}</h3>
                        <div className="flex items-center gap-2">
                          {immunization.compliant ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className={`text-sm ${immunization.compliant ? "text-green-600" : "text-red-600"}`}>
                            {immunization.complianceMessage}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Doses: {immunization.doses}</p>
                      {immunization.immunizationDates && immunization.immunizationDates.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Dates: </span>
                          {immunization.immunizationDates.map((date: Date, i: number) => (
                            <span key={i}>
                              {date.toLocaleDateString()}
                              {i < immunization.immunizationDates.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(!healthData.healthConditions || healthData.healthConditions.length === 0) &&
              (!healthData.healthImmunizations || healthData.healthImmunizations.length === 0) && (
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Health Records Found</h3>
                  <p className="text-muted-foreground">
                    No health conditions or immunization records are currently available.
                  </p>
                </Card>
              )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
