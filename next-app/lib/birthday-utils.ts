import { BIRTHDAYS_DATA, type BirthdayDataset } from "@/lib/birthdays-data"

export type Person = {
  name: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  email: string
  phone: string
}

export type CountdownResult = {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  totalHours: number
  totalDays: number
}

export type Zodiac = {
  name: string
  icon: string
}

const ZODIAC_BOUNDARIES: Array<{ name: string; icon: string; end: [number, number] }> = [
  { name: "Capricorn", icon: "♑", end: [1, 19] },
  { name: "Aquarius", icon: "♒", end: [2, 18] },
  { name: "Pisces", icon: "♓", end: [3, 20] },
  { name: "Aries", icon: "♈", end: [4, 19] },
  { name: "Taurus", icon: "♉", end: [5, 20] },
  { name: "Gemini", icon: "♊", end: [6, 20] },
  { name: "Cancer", icon: "♋", end: [7, 22] },
  { name: "Leo", icon: "♌", end: [8, 22] },
  { name: "Virgo", icon: "♍", end: [9, 22] },
  { name: "Libra", icon: "♎", end: [10, 22] },
  { name: "Scorpio", icon: "♏", end: [11, 21] },
  { name: "Sagittarius", icon: "♐", end: [12, 21] },
  { name: "Capricorn", icon: "♑", end: [12, 31] },
]

export function getPeopleFromDataset(data: BirthdayDataset = BIRTHDAYS_DATA): Person[] {
  return Object.entries(data).map(([name, entry]) => {
    const [year, month, day] = entry.date.split("-").map(Number)
    const [hour, minute] = entry.time.split(":").map(Number)

    return {
      name,
      year,
      month,
      day,
      hour,
      minute,
      email: entry.email,
      phone: entry.phone,
    }
  })
}

export function calculateCountdown(person: Person, now: Date): CountdownResult {
  const nextBirthday = new Date(
    now.getFullYear(),
    person.month - 1,
    person.day,
    person.hour,
    person.minute,
    0,
    0,
  )

  if (nextBirthday < now) {
    nextBirthday.setFullYear(now.getFullYear() + 1)
  }

  const diffMs = nextBirthday.getTime() - now.getTime()
  const totalSeconds = diffMs / 1000
  const totalMinutes = totalSeconds / 60
  const totalHours = totalMinutes / 60
  const totalDays = totalHours / 24

  return {
    days: Math.floor(totalDays),
    hours: Math.floor(totalHours % 24),
    minutes: Math.floor(totalMinutes % 60),
    seconds: Math.floor(totalSeconds % 60),
    totalSeconds,
    totalHours,
    totalDays,
  }
}

export function calculateAge(person: Person, now: Date): number {
  const birthDate = new Date(
    person.year,
    person.month - 1,
    person.day,
    person.hour,
    person.minute,
    0,
    0,
  )

  const ageYears = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

  if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 150) {
    return 0
  }

  return ageYears
}

export function isBirthdayToday(person: Person, now: Date): boolean {
  return now.getMonth() === person.month - 1 && now.getDate() === person.day
}

export function getZodiacSign(month: number, day: number): Zodiac {
  for (const sign of ZODIAC_BOUNDARIES) {
    const [endMonth, endDay] = sign.end
    if (month < endMonth || (month === endMonth && day <= endDay)) {
      return { name: sign.name, icon: sign.icon }
    }
  }

  return { name: "Capricorn", icon: "♑" }
}
