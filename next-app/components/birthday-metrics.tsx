import type { Birthday } from "@/lib/birthdays-data"
import {
  currentAge,
  dateLabel,
  isBirthdayToday,
  timeLabel,
  turningAge,
} from "@/lib/birthday-utils"

type Props = { person: Birthday; now: Date }

export function LiveAge({ person, now }: Props) {
  const [years, fraction] = currentAge(person, now).toFixed(10).split(".")
  return (
    <div className="live-age" aria-label={`${person.name}'s current age`}>
      <span className="metric-label">
        <i aria-hidden="true" /> Current age
      </span>
      <div className="metric-value">
        <strong>
          {years}
          <span>.{fraction}</span>
        </strong>
        <span className="metric-unit">years</span>
      </div>
    </div>
  )
}

export function BirthdayMetrics({ person, now }: Props) {
  const today = isBirthdayToday(person, now)
  const age = turningAge(person, now, today)

  return (
    <div className="person-metrics">
      <LiveAge person={person} now={now} />
      <div className="birthday-milestone">
        <span className="metric-label">
          {today ? "Today's celebration" : "Next celebration"}
        </span>
        <strong>{today ? `Celebrating ${age}` : `Turning ${age}`}</strong>
        <span className="milestone-date">
          {dateLabel(person)} <span aria-hidden="true">·</span>{" "}
          {timeLabel(person)} IST
        </span>
      </div>
    </div>
  )
}
