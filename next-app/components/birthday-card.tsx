"use client"

import { ArrowUpRight, Sparkle } from "@phosphor-icons/react"
import dynamic from "next/dynamic"
import { useState, type CSSProperties } from "react"
import type { Birthday } from "@/lib/birthdays-data"
import {
  birthdayParts,
  countdownParts,
  dateLabel,
  nextBirthdayMoment,
  timeLabel,
  turningAge,
} from "@/lib/birthday-utils"
import "./birthday-card.css"
import { LiveAge } from "./birthday-metrics"

const BirthdayCake = dynamic(() => import("./birthday-cake"), {
  ssr: false,
  loading: () => (
    <div className="cake-loading" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  ),
})

type Props = { person: Birthday; now: Date; today: boolean; shared?: boolean }

export function BirthdayCard({ person, now, today, shared = false }: Props) {
  const [wishMade, setWishMade] = useState(false)
  const [celebration, setCelebration] = useState(0)
  const { day, month } = birthdayParts(person)
  const countdown = countdownParts(nextBirthdayMoment(person, now), now)
  const age = turningAge(person, now, today)
  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, month - 1, 1)))

  function makeWish() {
    if (!wishMade) setCelebration((value) => value + 1)
    setWishMade((value) => !value)
  }

  return (
    <article
      className={`birthday-feature ${today ? "birthday-feature-today" : ""} ${wishMade ? "birthday-wished" : ""} ${shared ? "birthday-feature-shared" : ""}`}
      aria-label={`${person.name}'s birthday card`}
    >
      <div className="birthday-feature-topline">
        <span className="birthday-status">
          <Sparkle size={15} weight="fill" aria-hidden="true" />
          {today ? "A DAY JUST FOR YOU" : "THE NEXT CELEBRATION"}
        </span>
        <span className="birthday-edition">Ages birthday club</span>
      </div>
      <div className="birthday-feature-content">
        <div className="birthday-feature-copy">
          <p className="birthday-greeting">
            {today ? "Happy birthday," : "The countdown is on for"}
          </p>
          <h2>
            {person.name}
            <span>.</span>
          </h2>
          <p className="birthday-message">
            {today
              ? `A little older. A little more iconic. Here's to ${age} years of you.`
              : `Another trip around the sun. Another very good reason to celebrate.`}
          </p>
          <div className="birthday-details">
            <span>{dateLabel(person)}</span>
            <i aria-hidden="true" />
            <span>{today ? `${age} looks good on you` : `Turning ${age}`}</span>
          </div>
          {!today && <LiveAge person={person} now={now} />}
          {today ? (
            <div className="birthday-wish-controls">
              <button className="birthday-wish-button" onClick={makeWish}>
                <Sparkle size={18} weight="fill" aria-hidden="true" />
                {wishMade ? "One more wish?" : "Make a wish"}
                <ArrowUpRight size={19} aria-hidden="true" />
              </button>
              <p className="birthday-wish-note" role="status">
                {wishMade
                  ? "Wish made. This one's going to be a good year."
                  : "Close your eyes. We'll take care of the candles."}
              </p>
            </div>
          ) : (
            <div
              className="birthday-countdown"
              aria-label={`Time until ${person.name}'s birthday`}
            >
              {Object.entries(countdown).map(([unit, value]) => (
                <div key={unit}>
                  <strong>{String(value).padStart(2, "0")}</strong>
                  <span>{unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="birthday-stage">
          <div className="birthday-stage-halo" aria-hidden="true" />
          <div className="birthday-date-stamp">
            <span>{monthLabel}</span>
            <strong>{String(day).padStart(2, "0")}</strong>
            <span>save the date</span>
          </div>
          <BirthdayCake extinguished={today && wishMade} />
          <span className="birthday-stage-caption">
            {wishMade
              ? "a wish for the year ahead"
              : "a little slice of happiness"}
          </span>
          {today && wishMade && (
            <div
              className="birthday-confetti"
              key={celebration}
              aria-hidden="true"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  style={
                    {
                      "--x": `${(i * 43) % 100}%`,
                      "--delay": `${(i % 6) * 0.06}s`,
                      "--spin": `${(i % 2 ? 1 : -1) * (120 + i * 17)}deg`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="birthday-feature-footer">
        <span>
          {today
            ? "THE WORLD GOT LUCKIER ON THIS DAY."
            : "GOOD THINGS ARE WORTH THE WAIT."}
        </span>
        <span>
          {timeLabel(person)} <span className="birthday-timezone">IST</span>
        </span>
      </div>
    </article>
  )
}
