"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthManager } from "@/lib/auth"
import { User, BookOpen, Calendar, Clock, Activity, LogOut, Menu, X, Home, Heart } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = () => {
    const authManager = AuthManager.getInstance()
    authManager.logout()
    router.push("/")
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Grades", href: "/dashboard/grades", icon: BookOpen },
    { name: "Schedule", href: "/dashboard/schedule", icon: Clock },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Attendance", href: "/dashboard/attendance", icon: Activity },
    { name: "Health", href: "/dashboard/health", icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/90 backdrop-blur-md lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-card/80 backdrop-blur-xl border-r border-border/50 transform transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 lg:p-8 border-b border-border/50">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">bettervue</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:bg-muted/50 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 p-4 lg:p-6 space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-4 h-12 lg:h-14 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-slide-in ${
                    isActive ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" : "hover:bg-muted/50"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                  <span className="font-medium">{item.name}</span>
                </Button>
              )
            })}
          </nav>

          <div className="p-4 lg:p-6 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 h-12 lg:h-14 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden hover:bg-muted/50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-end gap-4 sm:block text-sm text-muted-foreground w-full">
              {mounted &&
                new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
