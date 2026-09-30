// Public display data only. Keep contact details out of the site bundle.
export const birthdays = [
  { name: "Aliqyaan", date: "2005-11-12", time: "13:15" },
  { name: "Russel", date: "2005-03-22", time: "23:30" },
  { name: "Romeiro", date: "2005-10-11", time: "02:37" },
  { name: "Dylan", date: "2006-05-13", time: "11:35" },
  { name: "Gavin", date: "2005-03-10", time: "21:14" },
  { name: "Rhea", date: "2006-01-03", time: "00:00" },
  { name: "Moiz", date: "2005-02-15", time: "00:00" },
  { name: "Rohan", date: "2004-11-12", time: "10:12" },
  { name: "Reniyas", date: "2005-09-19", time: "11:50" },
  { name: "Mayank", date: "2005-06-13", time: "11:50" },
] as const

export type Birthday = (typeof birthdays)[number]
