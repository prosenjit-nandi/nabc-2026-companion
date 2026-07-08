const SOURCE_URL = 'https://nabcapp.com/custom/event-schedule.php?json=1'

function titleCase(value) {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toIso(date, time) {
  // date: "July 3, 2026", time: "2:00 PM" -> parsed as a local wall-clock datetime
  const parsed = new Date(`${date} ${time}`)
  if (Number.isNaN(parsed.getTime())) return null
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}` +
    `T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:00`
  )
}

async function fetchWithRetry(url, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return await res.json()
    } catch (err) {
      if (attempt === attempts) throw err
      console.warn(`Fetch attempt ${attempt}/${attempts} failed (${err.message}), retrying...`)
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

// Fetches and normalizes nabcapp.com's event-schedule JSON into the app's
// generic ScheduleEvent shape (src/types/schedule.ts).
export async function fetchSchedule() {
  const data = await fetchWithRetry(SOURCE_URL)

  const events = data.rows.map((row) => {
    const hall = titleCase(row.hall)
    // source_row is unique within a sheet/day, and source_sheet differs per day,
    // so this stays stable and unique even when title+hall-bucket+time collide
    // (e.g. multiple TBD "Conference Room" sessions sharing a sentinel sort_time).
    const id = `${slugify(row.source_sheet)}-${row.source_row}`
    return {
      id,
      day: row.event_day,
      date: row.event_date,
      hall,
      title: row.program_name,
      details: row.program_details,
      startTime: row.start_time,
      endTime: row.end_time,
      startDateTime: toIso(row.event_date, row.start_time),
      endDateTime: toIso(row.event_date, row.end_time),
      status: row.status,
      sortDay: row.sort_day,
      sortTime: row.sort_time,
      sortHall: row.sort_hall,
    }
  })

  events.sort((a, b) => a.sortDay - b.sortDay || a.sortTime - b.sortTime || a.sortHall - b.sortHall)

  return {
    events,
    sourceGeneratedAt: data.generated_at,
    sourceLastChanged: data.last_changed,
  }
}
