"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, GraduationCap } from "lucide-react"

interface ProfileCardProps {
  // user info 
  user: {
    name: string
    id: string
    school: string
    grade: number
    photo?: string
  }
}

export function ProfileCard({ user }: ProfileCardProps) {
  // this code is cooked
  return (
    <Card className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:bg-card/70 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 animate-fade-in">
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
            {user.photo ? (
              <img
                src={user.photo || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 lg:h-10 lg:w-10 text-primary-foreground" />
            )}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h3 className="font-semibold text-base lg:text-lg text-foreground truncate">{user.name}</h3>
            <p className="text-sm text-muted-foreground">ID: {user.id}</p>
          </div>
        </div>

        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">School</span>
            </div>
            <span className="text-sm font-medium text-foreground text-right truncate">{user.school}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Grade</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-200"
            >
              Grade {user.grade}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
