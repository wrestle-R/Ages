# Ages

A small birthday calendar for friends. It shows the next birthday, a countdown, and a special card on each person's birthday. All dates and times use India Standard Time.

## Run locally

```bash
cd next-app
npm install
npm run dev
```

Open http://localhost:3000.

## Edit birthdays

Update `next-app/lib/birthdays-data.ts`. Each entry needs a name, a birth date in `YYYY-MM-DD` format, and a birth time in `HH:mm` format. The birth time is shown on the page and used for the countdown.

There is no backend, mail service, database, or environment variable to configure.
