export interface AuthCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  user?: {
    name: string
    id: string
    school: string
    grade: number
  }
}

export interface StudentVUEUser {
  name: string
  id: string
  school: string
  grade: number
  photo?: string
  password?: string
}

export class AuthManager {
  private static instance: AuthManager
  private user: StudentVUEUser | null = null
  private isAuthenticated = false

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  setUser(user: StudentVUEUser, password?: string) {
    this.user = { ...user, password }
    this.isAuthenticated = true
    if (typeof window !== "undefined") {
      sessionStorage.setItem("auth_user", JSON.stringify(this.user))
      sessionStorage.setItem("auth_status", "true")
    }
  }

  getUser(): StudentVUEUser | null {
    if (!this.user && typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("auth_user")
      const storedStatus = sessionStorage.getItem("auth_status")
      if (storedUser && storedStatus === "true") {
        this.user = JSON.parse(storedUser)
        this.isAuthenticated = true
      }
    }
    return this.user
  }

  isLoggedIn(): boolean {
    if (!this.isAuthenticated && typeof window !== "undefined") {
      const storedStatus = sessionStorage.getItem("auth_status")
      this.isAuthenticated = storedStatus === "true"
    }
    return this.isAuthenticated
  }

  logout() {
    this.user = null
    this.isAuthenticated = false
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_user")
      sessionStorage.removeItem("auth_status")
    }
  }
}
