"use client"

import { ArrowUpRight, Sparkle } from "@phosphor-icons/react"
import { useState } from "react"
import type { Birthday } from "@/lib/birthdays-data"
import {
  birthdayParts,
  countdownParts,
  dateLabel,
  nextBirthdayMoment,
  timeLabel,
  turningAge,
} from "@/lib/birthday-utils"

type Props = {
  person: Birthday
  now: Date
  today: boolean
}

export function BirthdayCard({ person, now, today }: Props) {
  const [wishMade, setWishMade] = useState(false)
  const { day, month } = birthdayParts(person)
  const countdown = countdownParts(nextBirthdayMoment(person, now), now)
  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, month - 1, 1)))

  return (
    <article className={`feature-card ${today ? "feature-card-today" : ""}`}>
      <div className="feature-copy">
        <div className="feature-eyebrow">
          <Sparkle size={18} weight="fill" aria-hidden="true" />
          <span>{today ? "TODAY IS THE DAY" : "UP NEXT"}</span>
        </div>
        <h2>
          {today ? (
            <>
              Happy birthday,
              <br />
              {person.name}.
            </>
          ) : (
            <>
              {person.name}&apos;s
              <br />
              big day.
            </>
          )}
        </h2>
        <p className="feature-description">
          {today
            ? `Here's to ${turningAge(person, now, true)} years of ${person.name}. Make a wish and enjoy your day.`
            : `${dateLabel(person)} is worth looking forward to. ${person.name} turns ${turningAge(person, now)} next.`}
        </p>

        {today ? (
          <button
            className="wish-button"
            onClick={() => setWishMade((made) => !made)}
          >
            {wishMade ? "Light candles again" : "Make a wish"}
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </button>
        ) : (
          <div
            className="countdown"
            aria-label={`Countdown to ${person.name}'s birthday`}
          >
            {Object.entries(countdown).map(([unit, value]) => (
              <div className="countdown-unit" key={unit}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="feature-art" aria-hidden="true">
        <div className="feature-orbit orbit-one" />
        <div className="feature-orbit orbit-two" />
        <span className="confetti confetti-one" />
        <span className="confetti confetti-two" />
        <span className="confetti confetti-three" />
        <span className="confetti confetti-four" />
        <div className="date-medallion">
          <span>{monthLabel}</span>
          <strong>{String(day).padStart(2, "0")}</strong>
        </div>
        {today && (
          <div className={`celebration-cake ${wishMade ? "wish-made" : ""}`}>
            <div className="cake-candle">
              <span className="cake-flame" />
            </div>
            <div className="cake-icing" />
            <div className="cake-body" />
            <div className="cake-plate" />
          </div>
        )}
        <span className="feature-art-note">
          {today ? "MAKE IT COUNT" : `BORN AT ${timeLabel(person)}`}
        </span>
      </div>
    </article>
  )
}
