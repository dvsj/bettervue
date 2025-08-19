"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { AuthManager } from "@/lib/auth"
import { useRouter } from "next/navigation"

type LoginStep = "username" | "password"

export function LoginForm() {
  const [screen, setScreen] = useState<'lander' | 'login' | 'help'>('lander')
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const result = await response.json()
      if (result.success) {
        const authManager = AuthManager.getInstance()
        authManager.setUser(result.user, password)
        router.push("/dashboard")
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const BackBtn = ({ onClick, className = "" }: { onClick: () => void, className?: string }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-smooth flex items-center absolute top-4 left-4 z-10 ${className}`}
      aria-label="back"
      type="button"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 16l-5-6 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  )

  if (screen === 'lander') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center font-mono animate-fade-in">
        <div className="flex flex-col items-center gap-2 mb-10">
          <span className="text-4xl font-bold tracking-wide lowercase text-primary">bettervue</span>
          <span className="text-muted-foreground text-xs lowercase">a better student information system</span>
        </div>
        <div className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-lg border border-border flex flex-col gap-4 animate-slide-in items-center">
          <div className="flex flex-col gap-2 w-full">
            <button onClick={() => setScreen('login')} className="w-full px-4 py-2 rounded-lg bg-input hover:bg-muted/30 transition-smooth text-base btn-hover lowercase text-center">
              <span className="text-primary">login</span>
            </button>
            <button onClick={() => setScreen('help')} className="w-full px-4 py-2 rounded-lg bg-input hover:bg-muted/30 transition-smooth text-base btn-hover lowercase text-center">
              <span className="text-primary">help</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'help') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center font-mono animate-fade-in">
        <div className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-lg border border-border flex flex-col gap-6 animate-slide-in items-center relative">
          <BackBtn onClick={() => setScreen('lander')} />
          <div className="flex flex-col gap-2 items-center">
            <h2 className="text-xl font-bold text-primary mb-2 lowercase">help</h2>
            <p className="text-muted-foreground text-sm lowercase text-center">
              if you forgot your password, you can reset it <a href="https://mystudent.fcps.edu/login.jsp" className="underline text-primary" target="_blank" rel="noopener noreferrer">here</a>. for all other issues, help, or contact, email <a href="mailto:dev@dvsj.xyz" className="underline text-primary">dev@dvsj.xyz</a>
            </p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 font-mono animate-fade-in relative">
      <div className="w-full max-w-sm flex flex-row items-center gap-2 mb-2 justify-center">
        <BackBtn onClick={() => setScreen('lander')} className="static relative top-0 left-0" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground lowercase">sign in</h1>
      </div>
      <p className="text-muted-foreground text-sm lowercase text-center">access your account</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6 bg-card p-8 rounded-2xl shadow-lg border border-border animate-slide-in">
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="h-12 text-base bg-input border border-border rounded-xl px-4 focus-ring lowercase"
            autoFocus
            required
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12 text-base bg-input border border-border rounded-xl px-4 pr-12 focus-ring lowercase"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted/50"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
            </button>
          </div>
        </div>
        {error && (
          <div className="text-destructive text-sm text-center bg-destructive/10 rounded-lg p-2 animate-fade-in lowercase">{error}</div>
        )}
        <Button
          type="submit"
          className="w-full h-12 text-base bg-primary text-primary-foreground rounded-xl font-medium btn-hover lowercase"
          disabled={!username.trim() || !password.trim() || isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">signing in...</span>
          ) : (
            "sign in"
          )}
        </Button>
      </form>
    </div>
  )
}
