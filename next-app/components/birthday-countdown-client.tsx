"use client"

import { ArrowRight, Cake, Clock } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { BirthdayCard } from "@/components/birthday-card"
import { birthdays } from "@/lib/birthdays-data"
import {
  dateLabel,
  isBirthdayToday,
  nextBirthdayMoment,
  timeLabel,
  turningAge,
} from "@/lib/birthday-utils"

export function BirthdayCountdownClient() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setNow(new Date())
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [])

  const sorted = now
    ? [...birthdays].sort(
        (a, b) => nextBirthdayMoment(a, now) - nextBirthdayMoment(b, now)
      )
    : [...birthdays]
  const today = now
    ? sorted.filter((person) => isBirthdayToday(person, now))
    : []
  const featured = today.length ? today : sorted.slice(0, 1)
  const calendar = now
    ? [
        ...today,
        ...sorted.filter(
          (person) => !today.some((celebrant) => celebrant.name === person.name)
        ),
      ]
    : sorted
  const currentDate = now
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(now)
    : "Birthday calendar"

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Ages, back to top">
          ages<span>.</span>
        </a>
        <div className="header-date">
          <Clock size={16} aria-hidden="true" /> {currentDate}{" "}
          <span>· IST</span>
        </div>
      </header>

      <div id="top" className="page-content">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="intro-kicker">
              <Cake size={18} weight="fill" aria-hidden="true" /> THE BIRTHDAY
              CLUB
            </p>
            <h1 id="page-title">
              Good people.
              <br />
              <em>Great birthdays.</em>
            </h1>
          </div>
          <p className="intro-note">
            A little place to keep track of the days worth celebrating.
          </p>
        </section>

        <section
          className="featured-section"
          aria-label={today.length ? "Birthdays today" : "Next birthday"}
        >
          {now ? (
            featured.map((person) => (
              <BirthdayCard
                key={person.name}
                person={person}
                now={now}
                today={today.length > 0}
              />
            ))
          ) : (
            <div
              className="feature-placeholder"
              aria-label="Loading birthdays"
            />
          )}
        </section>

        <section
          className="calendar-section"
          aria-labelledby="calendar-heading"
        >
          <div className="section-heading">
            <div>
              <p className="section-kicker">THE PEOPLE</p>
              <h2 id="calendar-heading">The birthday list</h2>
            </div>
            <span>{birthdays.length} good reasons to celebrate</span>
          </div>

          <div className="birthday-list">
            {calendar.map((person, index) => (
              <div
                className={`birthday-row ${now && isBirthdayToday(person, now) ? "birthday-row-today" : ""}`}
                key={person.name}
              >
                <span className="row-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="row-avatar" aria-hidden="true">
                  {person.name.slice(0, 1)}
                </div>
                <div className="row-name">
                  <h3>{person.name}</h3>
                  <span>
                    {now && isBirthdayToday(person, now)
                      ? "Birthday today"
                      : `Turning ${now ? turningAge(person, now) : "..."}`}
                  </span>
                </div>
                <span className="row-date">{dateLabel(person)}</span>
                <span className="row-time">{timeLabel(person)} IST</span>
                <ArrowRight
                  className="row-arrow"
                  size={18}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <span>Made for the birthdays that matter.</span>
        <span>All dates and times in India Standard Time.</span>
      </footer>
    </main>
  )
}
