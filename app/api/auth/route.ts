import { type NextRequest, NextResponse } from "next/server"
import { StudentVUEAPI } from "@/lib/studentvue-api"

export async function POST(request: NextRequest) {
  try {
  // extracting credentials more like ofikhdssdf  giuoerog fdkfldkjlfdslkj f
  const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 })
    }


    const api = new StudentVUEAPI(username, password)

    const authResult = await api.authenticate()

    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error || "Authentication failed" }, { status: 401 })
    }


    const userData = {
      name: username,
      id: username,
      school: "School District",
      grade: 1,
    }


    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
