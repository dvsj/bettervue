"use client"
import { LoginForm } from "@/components/login-form"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse-slow"></div>

      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      ></div>

      <div
        className={`w-full max-w-md relative z-10 transition-all duration-1000 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <LoginForm />
      </div>
    </main>
  )
}
