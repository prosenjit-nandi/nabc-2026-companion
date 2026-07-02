export interface ScheduleEvent {
  id: string
  day: string
  date: string
  hall: string
  title: string
  details: string
  startTime: string
  endTime: string
  startDateTime: string | null
  endDateTime: string | null
  status: string
  sortDay: number
  sortTime: number
  sortHall: number
}

export interface ScheduleFile {
  generatedAt: string
  sourceGeneratedAt: number
  sourceLastChanged: number
  events: ScheduleEvent[]
}
