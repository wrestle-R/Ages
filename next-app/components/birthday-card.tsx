"use client"

import { Cake, Gift } from "@phosphor-icons/react"
import { getZodiacSign, type CountdownResult, type Person } from "@/lib/birthday-utils"

type BirthdayCardProps = {
  person: Person
  countdown: CountdownResult
  currentAge: number
  isBirthday: boolean
  onCelebrate: () => void
}

export function BirthdayCard({ person, countdown, currentAge, isBirthday, onCelebrate }: BirthdayCardProps) {
  const zodiac = getZodiacSign(person.month, person.day)
  const progress = Math.max(5, 100 - (countdown.totalDays / 365) * 100)

  return (
    <article
      className={`glass-card card-reveal group relative overflow-hidden p-5 sm:p-6 ${
        isBirthday ? "ring-2 ring-primary/60 shadow-[0_0_40px_rgba(66,132,197,0.35)]" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/30 text-white/95 transition ${
            isBirthday ? "bg-primary/45" : "bg-white/10 group-hover:bg-white/20"
          }`}
        >
          {isBirthday ? <Cake size={24} weight="fill" /> : <Gift size={22} weight="bold" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-xl font-semibold text-white">{person.name}</h3>
            <span className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
              {zodiac.icon} {zodiac.name}
            </span>
          </div>

          <p className="text-sm text-white/65">
            {isBirthday ? "It is birthday time." : "Days until birthday"}
          </p>

          {!isBirthday ? (
            <p className="mt-2 font-mono text-3xl font-bold leading-tight text-white tabular-nums drop-shadow-md">
              {countdown.totalDays.toFixed(8)}
            </p>
          ) : (
            <div className="mt-3 space-y-1">
              <p className="text-lg font-semibold text-white">Happy Birthday!</p>
              <p className="text-sm text-white/80">Now turning {Math.floor(currentAge)} years old.</p>
            </div>
          )}
        </div>
      </div>

      {!isBirthday && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/90 via-cyan-300/90 to-primary/80 transition-none will-change-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70 sm:grid-cols-4">
        <div className="rounded-lg bg-white/10 p-2">{countdown.days}d</div>
        <div className="rounded-lg bg-white/10 p-2">{countdown.hours}h</div>
        <div className="rounded-lg bg-white/10 p-2">{countdown.minutes}m</div>
        <div className="rounded-lg bg-white/10 p-2">{countdown.seconds}s</div>
      </div>

      <p className="mt-4 font-mono text-xs text-white/70 tabular-nums">
        Current age: <span className="font-semibold text-white/90">{currentAge.toFixed(12)}</span>
      </p>

      {isBirthday && (
        <button className="glass-btn mt-4 w-full rounded-xl px-3 py-2 text-sm font-semibold text-white" onClick={onCelebrate}>
          Open cake celebration
        </button>
      )}
    </article>
  )
}
