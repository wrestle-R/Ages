import type { Birthday } from "@/lib/birthdays-data"

const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000

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
