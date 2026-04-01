"use client"

import { ClockCountdown, Sparkle } from "@phosphor-icons/react"
import { useEffect, useMemo, useState } from "react"
import { BirthdayCard } from "@/components/birthday-card"
import { BirthdayCakeModal } from "@/components/birthday-cake-modal"
import {
  BIRTHDAYS_DATA,
} from "@/lib/birthdays-data"
import {
  calculateAge,
  calculateCountdown,
  getPeopleFromDataset,
  isBirthdayToday,
} from "@/lib/birthday-utils"

type DisplayPerson = ReturnType<typeof buildDisplayPeople>[number]

function buildDisplayPeople(now: Date) {
  return getPeopleFromDataset(BIRTHDAYS_DATA)
    .map((person) => {
      const countdown = calculateCountdown(person, now)
      const birthday = isBirthdayToday(person, now)
      const currentAge = calculateAge(person, now)

      return {
        ...person,
        countdown,
        isBirthday: birthday,
        currentAge,
      }
    })
    .sort((a, b) => a.countdown.totalSeconds - b.countdown.totalSeconds)
}

export function BirthdayCountdownClient() {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [selectedPerson, setSelectedPerson] = useState<DisplayPerson | null>(null)

  useEffect(() => {
    setMounted(true)
    let animationFrameId: number

    const tick = () => {
      setNow(new Date())
      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  const people = useMemo(() => buildDisplayPeople(now), [now])
  const birthdayPerson = people.find((person) => person.isBirthday)

  if (!mounted) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
        <div className="bg-orb bg-orb-one" aria-hidden />
        <div className="bg-orb bg-orb-two" aria-hidden />
        <div className="bg-orb bg-orb-three" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <section className="glass-nav rounded-3xl px-5 py-6 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Ages</p>
                <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">Birthday Countdown</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
                  Live timelapse until each next birthday. Built in Next.js with frosted glass visuals and smooth
                  precision updates.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="bg-orb bg-orb-one" aria-hidden />
      <div className="bg-orb bg-orb-two" aria-hidden />
      <div className="bg-orb bg-orb-three" aria-hidden />

      <div className="relative mx-auto max-w-7xl">
        <section className="glass-nav rounded-3xl px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Ages</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">Birthday Countdown</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
                Live timelapse until each next birthday. Built in Next.js with frosted glass visuals and smooth
                precision updates.
              </p>
            </div>

            <div className="glass-card rounded-2xl px-4 py-3 text-sm text-white/80 sm:text-base">
              <div className="flex items-center gap-2 text-white">
                <ClockCountdown size={20} weight="duotone" />
                <span className="font-medium">{now.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {birthdayPerson && (
          <section className="glass-card mt-6 rounded-3xl px-5 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/65">Today spotlight</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  It is {birthdayPerson.name}&apos;s birthday today
                </h2>
                <p className="mt-2 text-sm text-white/75">Tap celebrate to open the animated birthday cake.</p>
              </div>

              <button
                className="glass-btn inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
                onClick={() => setSelectedPerson(birthdayPerson)}
              >
                <Sparkle size={18} weight="fill" />
                Celebrate now
              </button>
            </div>
          </section>
        )}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person, index) => (
            <div key={person.name} style={{ animationDelay: `${index * 60}ms` }}>
              <BirthdayCard
                person={person}
                countdown={person.countdown}
                currentAge={person.currentAge}
                isBirthday={person.isBirthday}
                onCelebrate={() => setSelectedPerson(person)}
              />
            </div>
          ))}
        </section>
      </div>

      {selectedPerson && (
        <BirthdayCakeModal
          name={selectedPerson.name}
          age={selectedPerson.currentAge}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </main>
  )
}
