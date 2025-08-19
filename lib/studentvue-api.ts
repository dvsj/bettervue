const baseApiUrl = process.env.NEXT_PUBLIC_INTERNAL_API_BASE_URL || "https://localhost:3000"
interface StudentVUEConfig {
  baseURL: string
}

interface APIResponse {
  success: boolean
  data?: any
  error?: string
}

export class StudentVUEAPI {
  private config: StudentVUEConfig
  private username: string
  private password: string

  // why do i keep writing api wrappers
  constructor(username: string, password: string) {
    this.config = {
      baseURL: "https://sisstudent.fcps.edu/SVUE/Service/PXPCommunication.asmx",
    }
    this.username = username
    this.password = password
  }

  async request(method: string, params: Record<string, any> = {}): Promise<APIResponse> {
    try {

      const response = await fetch(`${baseApiUrl}/api/studentvue-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          method,
          params,
        }),
      })

      const result = await response.json()

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  async authenticate(): Promise<APIResponse> {
    return this.request("StudentInfo")
  }

  async getChildList(): Promise<APIResponse> {
    return this.request("ChildList")
  }

  async getStudent(): Promise<APIResponse> {
    return this.request("StudentInfo")
  }

  async getGrades(term?: number): Promise<APIResponse> {
    const params = term ? { ReportPeriod: term } : {}
    return this.request("Gradebook", params)
  }

  async getAttendance(): Promise<APIResponse> {
    return this.request("Attendance")
  }

  async getSchedule(term?: number): Promise<APIResponse> {
    const params = { TermIndex: term !== undefined ? term : 0 }
    return this.request("StudentClassList", params)
  }

  async getClassSchedule(term?: number): Promise<APIResponse> {
    return this.getSchedule(term)
  }

  async getTermList(): Promise<APIResponse> {
    return this.request("StudentClassList", { TermIndex: 0 })
  }

  async getCalendar(date?: Date): Promise<APIResponse> {
    const dateString = date
      ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      : new Date().toISOString().split("T")[0]
    return this.request("StudentCalendar", { RequestDate: dateString })
  }

  async getHealthInfo(
    healthModules = { healthVisits: true, healthConditions: true, healthImmunizations: true },
  ): Promise<APIResponse> {
    return this.request("StudentHealthInfo", {
      HealthVisits: healthModules.healthVisits,
      HealthConditions: healthModules.healthConditions,
      HealthImmunizations: healthModules.healthImmunizations,
    })
  }

  parseStudentInfo(data: any) {
    if (!data || !data.StudentInfo) return null

    const student = data.StudentInfo
    return {
      name: student.FormattedName?._text || student.name || "Unknown Student",
      id: student.PermID?._text || student.id || "Unknown ID",
      gender: student.Gender?._text || "",
      grade: Number.parseInt(student.Grade?._text) || 12,
      address: student.Address?._text || "",
      birthdate: student.BirthDate?._text ? new Date(student.BirthDate._text) : null,
      email: student.EMail?._text || "",
      phone: student.Phone?._text || "",
      school: student.CurrentSchool?._text || "Unknown School",
      photo: student.Photo?._text || null,
    }
  }

  parseGrades(data: any) {
    if (!data || !data.Gradebook) return null

    const gradebook = data.Gradebook
    const courses = gradebook.Courses?.Course || []

    let totalPoints = 0
    let totalPossible = 0
    let courseCount = 0

    const parsedCourses = courses.map((course: any) => {
      const marks = course.Marks?.Mark || []
      const latestMark = marks[0] || {}

      if (latestMark.CalculatedScoreRaw && !isNaN(Number.parseFloat(latestMark.CalculatedScoreRaw))) {
        totalPoints += Number.parseFloat(latestMark.CalculatedScoreRaw)
        totalPossible += 100
        courseCount++
      }

      return {
        period: Number.parseInt(course._attributes?.Period) || 0,
        name: course._attributes?.Title || "Unknown Course",
        teacher: course._attributes?.Staff || "Unknown Teacher",
        room: course._attributes?.Room || "",
        grade: latestMark.CalculatedScoreString || "N/A",
        rawScore: Number.parseFloat(latestMark.CalculatedScoreRaw) || 0,
      }
    })

    const gpa = courseCount > 0 ? ((totalPoints / totalPossible) * 4.0).toFixed(2) : "0.00"

    return {
      courses: parsedCourses,
      gpa: Number.parseFloat(gpa),
      reportPeriod: gradebook.ReportingPeriod?._attributes?.GradePeriod || "Current Term",
    }
  }

  parseTermList(data: any) {
    if (!data || !data.StudentClassSchedule) return []

    const schedule = data.StudentClassSchedule

    if (schedule.TermLists?.TermListing) {
      const terms = Array.isArray(schedule.TermLists.TermListing)
        ? schedule.TermLists.TermListing
        : [schedule.TermLists.TermListing]

      return terms.map((term: any) => ({
        index: Number.parseInt(term._attributes?.TermIndex) || 0,
        name: term._attributes?.TermName || term._attributes?.TermIndexName || "Unknown Term",
        beginDate: term._attributes?.BeginDate ? new Date(term._attributes.BeginDate) : null,
        endDate: term._attributes?.EndDate ? new Date(term._attributes.EndDate) : null,
      }))
    }

    if (schedule._attributes?.TermIndexName) {
      return [
        {
          index: 0,
          name: schedule._attributes.TermIndexName,
          beginDate: null,
          endDate: null,
        },
      ]
    }

    return []
  }

  parseSchedule(data: any) {
    if (!data || !data.StudentClassSchedule) return null

    const schedule = data.StudentClassSchedule
    const classes = schedule.ClassLists?.ClassListing || []

    return {
      termName: schedule._attributes?.TermIndexName || "Current Term",
      classes: classes.map((cls: any) => ({
        period: Number.parseInt(cls._attributes?.Period) || 0,
        name: cls._attributes?.CourseTitle || "Unknown Course",
        teacher: cls._attributes?.Teacher || "Unknown Teacher",
        room: cls._attributes?.RoomName || "",
        email: cls._attributes?.TeacherEmail || "",
      })),
    }
  }

  parseClassSchedule(data: any) {
    return this.parseSchedule(data)
  }

  parseCalendar(data: any) {
    if (!data || !data.CalendarListing) return null

    const calendar = data.CalendarListing
    const events = calendar.EventLists?.EventList || []

    return {
      schoolStart: calendar._attributes?.SchoolBegDate ? new Date(calendar._attributes.SchoolBegDate) : null,
      schoolEnd: calendar._attributes?.SchoolEndDate ? new Date(calendar._attributes.SchoolEndDate) : null,
      monthStart: calendar._attributes?.MonthBegDate ? new Date(calendar._attributes.MonthBegDate) : null,
      monthEnd: calendar._attributes?.MonthEndDate ? new Date(calendar._attributes.MonthEndDate) : null,
      events: events.map((event: any) => ({
        date: event._attributes?.Date ? new Date(event._attributes.Date) : null,
        title: event._attributes?.Title || "Unknown Event",
        dayType: event._attributes?.DayType || "",
        description: event._attributes?.EvtDescription || "",
      })),
    }
  }

  parseAttendance(data: any) {
    if (!data || !data.Attendance) return null

    const attendance = data.Attendance
    const absences = attendance.Absences?.Absence || []

    const totalDays = 180
    const absentDays = absences.length
    const attendanceRate = Math.round(((totalDays - absentDays) / totalDays) * 100)

    return {
      rate: attendanceRate,
      absences: absences.length,
      tardies: attendance.TotalTardies?.PeriodTotal?.length || 0,
      recentAbsences: absences.slice(0, 5).map((absence: any) => ({
        date: absence._attributes?.AbsenceDate || "",
        reason: absence._attributes?.Reason || "Unexcused",
      })),
    }
  }

  parseHealthInfo(data: any) {
    if (!data || !data.StudentHealthData) return null

    const health = data.StudentHealthData

    const healthConditions = (health.HealthConditionsListings?.HealthConditionsListing || []).map((condition: any) => ({
      condition: condition._attributes?.ConditionCode || "Unknown Condition",
      comment: condition._attributes?.Comment || "",
      startDate: condition._attributes?.StartDate ? new Date(condition._attributes.StartDate) : null,
      endDate: condition._attributes?.EndDate ? new Date(condition._attributes.EndDate) : null,
    }))

    const healthImmunizations = (health.HealthImmunizationListings?.HealthImmunizationListing || []).map(
      (immunization: any) => ({
        name: immunization._attributes?.Name || "Unknown Immunization",
        compliant: immunization._attributes?.Compliant === "true",
        complianceMessage: immunization._attributes?.CompliantMessage || "",
        doses: Number.parseInt(immunization._attributes?.NumReqDoses) || 0,
        immunizationDates: (immunization.ImmunizationDatesData?.ImmunizationDate || []).map(
          (date: any) => new Date(date._attributes?.ImmunizationDt),
        ),
      }),
    )

    return {
      healthConditions,
      healthImmunizations,
      healthVisits: [],
    }
  }
}