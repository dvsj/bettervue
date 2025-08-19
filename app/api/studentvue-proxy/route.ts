import { type NextRequest, NextResponse } from "next/server"

function parseXMLResponse(xmlString: string) {
  try {
    const match = xmlString.match(/<string[^>]*>(.*?)<\/string>/s)
    if (!match) return null

    const innerXML = match[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    const result: any = {}

    if (innerXML.includes("<StudentInfo")) {
      const studentMatch = innerXML.match(/<StudentInfo[^>]*>(.*?)<\/StudentInfo>/s)
      if (studentMatch) {
        result.StudentInfo = {
          FormattedName: { _text: extractValue(studentMatch[1], "FormattedName") },
          PermID: { _text: extractValue(studentMatch[1], "PermID") },
          Grade: { _text: extractValue(studentMatch[1], "Grade") },
          CurrentSchool: { _text: extractValue(studentMatch[1], "CurrentSchool") },
          Photo: { _text: extractValue(studentMatch[1], "Photo") },
          Gender: { _text: extractValue(studentMatch[1], "Gender") },
          Address: { _text: extractValue(studentMatch[1], "Address") },
          BirthDate: { _text: extractValue(studentMatch[1], "BirthDate") },
          EMail: { _text: extractValue(studentMatch[1], "EMail") },
          Phone: { _text: extractValue(studentMatch[1], "Phone") },
        }
      }
    }

    if (innerXML.includes("<Gradebook")) {
      const gradebookMatch = innerXML.match(/<Gradebook[^>]*>(.*?)<\/Gradebook>/s)
      if (gradebookMatch) {
        result.Gradebook = {
          ReportingPeriod: {
            _attributes: {
              GradePeriod: extractAttribute(gradebookMatch[1], "ReportingPeriod", "GradePeriod") || "Current Term",
            },
          },
          Courses: {
            Course: parseCourses(gradebookMatch[1]),
          },
        }
      }
    }

    if (innerXML.includes("<StudentClassSchedule")) {
      const scheduleMatch = innerXML.match(/<StudentClassSchedule[^>]*>(.*?)<\/StudentClassSchedule>/s)
      if (scheduleMatch) {
        const termIndex = extractAttribute(innerXML, "StudentClassSchedule", "TermIndex")
        const termIndexName = extractAttribute(innerXML, "StudentClassSchedule", "TermIndexName")

        result.StudentClassSchedule = {
          _attributes: {
            TermIndex: termIndex || "0",
            TermIndexName: termIndexName || "Current Term",
          },
          ClassLists: {
            ClassListing: parseClasses(scheduleMatch[1]),
          },
          TermLists: parseTermLists(scheduleMatch[1]),
        }
      }
    }

    if (innerXML.includes("<Attendance")) {
      const attendanceMatch = innerXML.match(/<Attendance[^>]*>(.*?)<\/Attendance>/s)
      if (attendanceMatch) {
        result.Attendance = {
          _attributes: {
            Type: extractAttribute(attendanceMatch[1], "Attendance", "Type") || "Period",
          },
          Absences: {
            Absence: parseAbsences(attendanceMatch[1]),
          },
        }
      }
    }

    if (innerXML.includes("<CalendarListing")) {
      const calendarMatch = innerXML.match(/<CalendarListing[^>]*>(.*?)<\/CalendarListing>/s)
      if (calendarMatch) {
        result.CalendarListing = {
          _attributes: {
            SchoolBegDate: extractAttribute(calendarMatch[1], "CalendarListing", "SchoolBegDate"),
            SchoolEndDate: extractAttribute(calendarMatch[1], "CalendarListing", "SchoolEndDate"),
            MonthBegDate: extractAttribute(calendarMatch[1], "CalendarListing", "MonthBegDate"),
            MonthEndDate: extractAttribute(calendarMatch[1], "CalendarListing", "MonthEndDate"),
          },
          EventLists: {
            EventList: parseCalendarEvents(calendarMatch[1]),
          },
        }
      }
    }

    if (innerXML.includes("<StudentHealthData")) {
      const healthMatch = innerXML.match(/<StudentHealthData[^>]*>(.*?)<\/StudentHealthData>/s)
      if (healthMatch) {
        result.StudentHealthData = {
          HealthConditionsListings: {
            HealthConditionsListing: parseHealthConditions(healthMatch[1]),
          },
          HealthImmunizationListings: {
            HealthImmunizationListing: parseHealthImmunizations(healthMatch[1]),
          },
        }
      }
    }

    return result
  } catch (error) {
    return null
  }
}

function extractValue(xml: string, tagName: string): string {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`, "i"))
  return match ? match[1].trim() : ""
}

function extractAttribute(xml: string, tagName: string, attrName: string): string {
  const match = xml.match(new RegExp(`<${tagName}[^>]*${attrName}="([^"]*)"`, "i"))
  return match ? match[1] : ""
}

function parseCourses(xml: string): any[] {
  const courses: any[] = []
  const courseMatches = xml.match(/<Course[^>]*>.*?<\/Course>/gs) || []

  courseMatches.forEach((courseXML) => {
    const course = {
      _attributes: {
        Period: extractAttribute(courseXML, "Course", "Period"),
        Title: extractAttribute(courseXML, "Course", "Title"),
        Staff: extractAttribute(courseXML, "Course", "Staff"),
        Room: extractAttribute(courseXML, "Course", "Room"),
      },
      Marks: {
        Mark: parseMarks(courseXML),
      },
    }
    courses.push(course)
  })

  return courses
}

function parseMarks(xml: string): any[] {
  const marks: any[] = []
  const markMatches = xml.match(/<Mark[^>]*>.*?<\/Mark>/gs) || []

  markMatches.forEach((markXML) => {
    const mark = {
      CalculatedScoreString: extractAttribute(markXML, "Mark", "CalculatedScoreString"),
      CalculatedScoreRaw: extractAttribute(markXML, "Mark", "CalculatedScoreRaw"),
    }
    marks.push(mark)
  })

  return marks
}

function parseClasses(xml: string): any[] {
  const classes: any[] = []
  const classMatches = xml.match(/<ClassListing[^>]*(?:\/>|>.*?<\/ClassListing>)/gs) || []

  classMatches.forEach((classXML) => {
    const cls = {
      _attributes: {
        Period: extractAttribute(classXML, "ClassListing", "Period"),
        CourseTitle: extractAttribute(classXML, "ClassListing", "CourseTitle"),
        Teacher: extractAttribute(classXML, "ClassListing", "Teacher"),
        RoomName: extractAttribute(classXML, "ClassListing", "RoomName"),
        TeacherEmail: extractAttribute(classXML, "ClassListing", "TeacherEmail"),
      },
    }
    classes.push(cls)
  })

  return classes
}

function parseAbsences(xml: string): any[] {
  const absences: any[] = []
  const absenceMatches = xml.match(/<Absence[^>]*>.*?<\/Absence>/gs) || []

  absenceMatches.forEach((absenceXML) => {
    const absence = {
      _attributes: {
        AbsenceDate: extractAttribute(absenceXML, "Absence", "AbsenceDate"),
        Reason: extractAttribute(absenceXML, "Absence", "Reason"),
      },
    }
    absences.push(absence)
  })

  return absences
}

function parseCalendarEvents(xml: string): any[] {
  const events: any[] = []
  const eventMatches = xml.match(/<EventList[^>]*\/>/g) || []

  eventMatches.forEach((eventXML) => {
    const event = {
      _attributes: {
        Date: extractAttribute(eventXML, "EventList", "Date"),
        Title: extractAttribute(eventXML, "EventList", "Title"),
        DayType: extractAttribute(eventXML, "EventList", "DayType"),
        EvtDescription: extractAttribute(eventXML, "EventList", "EvtDescription"),
        StartTime: extractAttribute(eventXML, "EventList", "StartTime"),
      },
    }
    events.push(event)
  })

  return events
}

function parseHealthConditions(xml: string): any[] {
  const conditions: any[] = []
  const conditionMatches = xml.match(/<HealthConditionsListing[^>]*\/>/g) || []

  conditionMatches.forEach((conditionXML) => {
    const condition = {
      _attributes: {
        ConditionCode: extractAttribute(conditionXML, "HealthConditionsListing", "ConditionCode"),
        Comment: extractAttribute(conditionXML, "HealthConditionsListing", "Comment"),
        StartDate: extractAttribute(conditionXML, "HealthConditionsListing", "StartDate"),
        EndDate: extractAttribute(conditionXML, "HealthConditionsListing", "EndDate"),
      },
    }
    conditions.push(condition)
  })

  return conditions
}

function parseHealthImmunizations(xml: string): any[] {
  const immunizations: any[] = []
  const immunizationMatches = xml.match(/<HealthImmunizationListing[^>]*>.*?<\/HealthImmunizationListing>/gs) || []

  immunizationMatches.forEach((immunizationXML) => {
    const immunization = {
      _attributes: {
        Name: extractAttribute(immunizationXML, "HealthImmunizationListing", "Name"),
        Compliant: extractAttribute(immunizationXML, "HealthImmunizationListing", "Compliant"),
        CompliantMessage: extractAttribute(immunizationXML, "HealthImmunizationListing", "CompliantMessage"),
        NumReqDoses: extractAttribute(immunizationXML, "HealthImmunizationListing", "NumReqDoses"),
      },
      ImmunizationDatesData: {
        ImmunizationDate: parseImmunizationDates(immunizationXML),
      },
    }
    immunizations.push(immunization)
  })

  return immunizations
}

function parseImmunizationDates(xml: string): any[] {
  const dates: any[] = []
  const dateMatches = xml.match(/<ImmunizationDate[^>]*\/>/g) || []

  dateMatches.forEach((dateXML) => {
    const date = {
      _attributes: {
        ImmunizationDt: extractAttribute(dateXML, "ImmunizationDate", "ImmunizationDt"),
      },
    }
    dates.push(date)
  })

  return dates
}

function parseTermLists(xml: string): any[] {
  const termLists: any[] = []
  const termMatches = xml.match(/<TermList[^>]*\/>/g) || []

  termMatches.forEach((termXML) => {
    const term = {
      _attributes: {
        TermIndex: extractAttribute(termXML, "TermList", "TermIndex"),
        TermName: extractAttribute(termXML, "TermList", "TermName"),
      },
    }
    termLists.push(term)
  })

  return termLists
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, method, params } = await request.json()

    if (!username || !password || !method) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }


    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
      <userID>${username}</userID>
      <password>${password}</password>
      <skipLoginLog>true</skipLoginLog>
      <parent>false</parent>
      <webServiceHandleName>PXPWebServices</webServiceHandleName>
      <methodName>${method}</methodName>
      <paramStr>${
        params && Object.keys(params).length > 0
          ? `<Parms>${Object.entries(params)
              .map(([key, value]) => `<${key}>${value}</${key}>`)
              .join("")}</Parms>`
          : "<Parms></Parms>"
      }</paramStr>
    </ProcessWebServiceRequest>
  </soap:Body>
</soap:Envelope>`

    const response = await fetch(
      "https://sisstudent.fcps.edu/SVUE/Service/PXPCommunication.asmx/ProcessWebServiceRequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          userID: username,
          password: password,
          skipLoginLog: "true",
          parent: "false",
          webServiceHandleName: "PXPWebServices",
          methodName: method,
          paramStr:
            params && Object.keys(params).length > 0
              ? `<Parms>${Object.entries(params)
                  .map(([key, value]) => `<${key}>${value}</${key}>`)
                  .join("")}</Parms>`
              : "<Parms></Parms>",
        }),
      },
    )

    if (!response.ok) {
      return NextResponse.json({ success: false, error: "StudentVUE API request failed" }, { status: response.status })
    }

    const responseText = await response.text()

    if (
      responseText.includes("RT_ERROR") ||
      responseText.includes("Invalid user id or password") ||
      responseText.includes("Authentication failed")
    ) {
      return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 })
    }

    if (
      responseText.includes("soap:Fault") ||
      responseText.includes("faultstring") ||
      responseText.includes("ERROR_MESSAGE")
    ) {
      return NextResponse.json({ success: false, error: "StudentVUE service error" }, { status: 500 })
    }

    let parsedData = parseXMLResponse(responseText)

    if (!parsedData) {
      try {
        const jsonData = JSON.parse(responseText)
        parsedData = jsonData.d || jsonData
      } catch {
        parsedData = responseText
      }
    }


    return NextResponse.json({
      success: true,
      data: parsedData,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Proxy server error" }, { status: 500 })
  }
}
