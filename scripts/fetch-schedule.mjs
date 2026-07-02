import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SOURCE_URL = 'https://nabcapp.com/custom/event-schedule.php?json=1'
const OUT_PATH = path.resolve(import.meta.dirname, '../public/data/schedule.json')

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

async function main() {
  const res = await fetch(SOURCE_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch schedule: ${res.status} ${res.statusText}`)
  }
  const data = await res.json()

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

  const output = {
    generatedAt: new Date().toISOString(),
    sourceGeneratedAt: data.generated_at,
    sourceLastChanged: data.last_changed,
    events,
  }

  await mkdir(path.dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(output, null, 2))
  console.log(`Wrote ${events.length} events to ${OUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
