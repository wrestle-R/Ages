"use client"

import { Cake, Clock } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { BirthdayCard } from "@/components/birthday-card"
import { birthdays } from "@/lib/birthdays-data"
import { BirthdayMetrics } from "./birthday-metrics"
import {
  dateLabel,
  groupBirthdays,
  isBirthdayToday,
} from "@/lib/birthday-utils"

export function BirthdayCountdownClient() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setNow(new Date())
    update()
    const interval = window.setInterval(update, 100)
    return () => window.clearInterval(interval)
  }, [])

  const groups = groupBirthdays(birthdays, now)
  const featured = groups[0] ?? []
  const celebrating =
    !!now && !!featured[0] && isBirthdayToday(featured[0], now)
  const shared = featured.length > 1
  const calendar = groups.flat()
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

        <div className="feature-actions">
          <span>
            <i aria-hidden="true" /> Every second counts.
          </span>
        </div>
        <section
          className={`featured-section ${now && shared ? "featured-section-shared" : ""}`}
          aria-label={celebrating ? "Birthdays today" : "Next birthdays"}
        >
          {now && shared && (
            <div className="shared-celebration-heading">
              <p>
                {celebrating ? "Today" : "Coming up"} · {dateLabel(featured[0])}{" "}
                · {featured.length} birthdays
              </p>
              <h2>
                {featured.length === 2
                  ? "Double the birthday joy."
                  : "More birthdays. More joy."}
              </h2>
              <span>A shared day. A celebration for each of you.</span>
            </div>
          )}
          {now ? (
            featured.map((person) => (
              <BirthdayCard
                key={person.name}
                person={person}
                now={now}
                today={celebrating}
                shared={shared}
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
            <span>Growing older, one moment at a time.</span>
          </div>

          <div className="birthday-list">
            {groups.map((group) => (
              <div
                className={`birthday-date-group ${group.length > 1 ? "birthday-date-group-shared" : ""}`}
                key={group[0].date.slice(5)}
              >
                {group.length > 1 && (
                  <div className="shared-date-label">
                    <Cake size={17} aria-hidden="true" />
                    <strong>{dateLabel(group[0])}</strong>
                    <span>{group.length} birthdays, one special day</span>
                  </div>
                )}
                {group.map((person) => (
                  <div
                    className={`birthday-row ${now && isBirthdayToday(person, now) ? "birthday-row-today" : ""}`}
                    key={person.name}
                  >
                    <div className="birthday-row-heading">
                      <span className="row-index">
                        {String(calendar.indexOf(person) + 1).padStart(2, "0")}
                      </span>
                      <div className="row-avatar" aria-hidden="true">
                        {person.name.slice(0, 1)}
                      </div>
                      <div className="row-name">
                        <h3>{person.name}</h3>
                        <span>
                          {now && isBirthdayToday(person, now)
                            ? "Birthday today"
                            : `Born in ${person.date.slice(0, 4)}`}
                        </span>
                      </div>
                    </div>
                    {now ? (
                      <BirthdayMetrics person={person} now={now} />
                    ) : (
                      <div className="metrics-placeholder">
                        Loading live counters…
                      </div>
                    )}
                  </div>
                ))}
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
