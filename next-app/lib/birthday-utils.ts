import type { Birthday } from "@/lib/birthdays-data"

const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000

export function groupBirthdays(people: readonly Birthday[], now: Date | null) {
  const byDate = new Map<string, Birthday[]>()
  for (const person of people) {
    const key = person.date.slice(5)
    const group = byDate.get(key) ?? []
    group.push(person)
    byDate.set(key, group)
  }
  const groups = [...byDate.values()]
  for (const group of groups) {
    group.sort(
      (a, b) => a.time.localeCompare(b.time) || a.name.localeCompare(b.name)
    )
  }
  if (now) {
    groups.sort((a, b) => {
      const aToday = isBirthdayToday(a[0], now)
      const bToday = isBirthdayToday(b[0], now)
      if (aToday !== bToday) return aToday ? -1 : 1
      return nextBirthdayMoment(a[0], now) - nextBirthdayMoment(b[0], now)
    })
  }
  return groups
}

export function indiaDate(now: Date) {
  const date = new Date(now.getTime() + INDIA_OFFSET_MS)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

export function birthdayParts(person: Birthday) {
  const [year, month, day] = person.date.split("-").map(Number)
  const [hour, minute] = person.time.split(":").map(Number)
  return { year, month, day, hour, minute }
}

export function isBirthdayToday(person: Birthday, now: Date) {
  const today = indiaDate(now)
  const birth = birthdayParts(person)
  return today.month === birth.month && today.day === birth.day
}

export function nextBirthdayMoment(person: Birthday, now: Date) {
  const today = indiaDate(now)
  const birth = birthdayParts(person)
  const moment = (year: number) =>
    Date.UTC(year, birth.month - 1, birth.day, birth.hour, birth.minute) -
    INDIA_OFFSET_MS

  const thisYear = moment(today.year)
  return thisYear > now.getTime() ? thisYear : moment(today.year + 1)
}

// Interpolate between birthday anniversaries so a year turns over at the
// recorded birth time, including years containing a leap day.
export function currentAge(person: Birthday, now: Date) {
  const birth = birthdayParts(person)
  const anniversary = (year: number) =>
    Date.UTC(year, birth.month - 1, birth.day, birth.hour, birth.minute) -
    INDIA_OFFSET_MS
  let year = indiaDate(now).year
  if (now.getTime() < anniversary(year)) year -= 1
  const previous = anniversary(year)
  const next = anniversary(year + 1)
  return Math.max(
    0,
    year - birth.year + (now.getTime() - previous) / (next - previous)
  )
}

export function turningAge(person: Birthday, now: Date, today = false) {
  const year = today
    ? indiaDate(now).year
    : indiaDate(new Date(nextBirthdayMoment(person, now))).year
  return year - birthdayParts(person).year
}

export function dateLabel(person: Birthday) {
  const { month, day } = birthdayParts(person)
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, month - 1, day)))
}

export function timeLabel(person: Birthday) {
  const { hour, minute } = birthdayParts(person)
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 1, hour, minute)))
}

export function countdownParts(target: number, now: Date) {
  const secondsLeft = Math.max(0, Math.ceil((target - now.getTime()) / 1000))
  return {
    days: Math.floor(secondsLeft / 86400),
    hours: Math.floor((secondsLeft % 86400) / 3600),
    minutes: Math.floor((secondsLeft % 3600) / 60),
    seconds: secondsLeft % 60,
  }
}
