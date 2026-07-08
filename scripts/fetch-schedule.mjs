import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { sources, activeSource } from './sources/index.mjs'

const OUT_PATH = path.resolve(import.meta.dirname, '../public/data/schedule.json')

async function main() {
  const fetchSchedule = sources[activeSource]
  if (!fetchSchedule) {
    throw new Error(`Unknown event source "${activeSource}". Available: ${Object.keys(sources).join(', ')}`)
  }

  let result
  try {
    result = await fetchSchedule()
  } catch (err) {
    // The source site is occasionally flaky. Don't fail the whole deploy over a
    // transient data-source outage — keep whatever schedule.json is already
    // committed and let code/UI changes ship; the next scheduled run retries.
    console.warn(
      `Could not fetch fresh schedule from "${activeSource}" after retries (${err.message}). ` +
        'Keeping existing public/data/schedule.json.',
    )
    return
  }

  const output = {
    generatedAt: new Date().toISOString(),
    sourceGeneratedAt: result.sourceGeneratedAt,
    sourceLastChanged: result.sourceLastChanged,
    events: result.events,
  }

  await mkdir(path.dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(output, null, 2))
  console.log(`Wrote ${result.events.length} events to ${OUT_PATH} (source: ${activeSource})`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
