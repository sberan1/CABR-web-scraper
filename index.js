import express from 'express';
import getQuotes from './scraper.js';
import { CronJob } from 'cron';
import ical, { ICalCalendarMethod } from 'ical-generator';
import * as dotenv from 'dotenv';
import {DateTime, Duration} from "luxon";

let cal;

dotenv.config();

const app = express();
const port = 3134;

const job = new CronJob(
  '0 */2 * * *', // cronTime
  async function () {
    await updateCalendar();
  }, // onTick
  null, // onComplete
  true, // start
  'America/Los_Angeles' // timeZone
);

async function updateCalendar() {
  const data = await getQuotes();
  const calendar = ical({ name: 'rozhodci - Beran' });

  // A method is required for outlook to display event as an invitation
  calendar.method(ICalCalendarMethod.REQUEST);
  for (const item of data) {
    const info = parseData(item);
    const [day, month, year] = info.date.split('.');
    const startTime = DateTime.fromISO(`${year}-${month}-${day}T${info.time}:00`).setZone("Europe/Prague");
    const endTime = startTime.plus(Duration.fromObject({ hours: 1, minutes: 30 }));
    console.log(`${info.teams}  - ${startTime} to ${endTime}`);
    calendar.createEvent({
      start: startTime,
      end: endTime,
      summary: `${info.teams} - ${info.category}`,
      location: info.hall,
      description: `Referees: ${info.referees},\nMatch number: ${info.matchNumber},\nCompetition: ${info.competition}`,
    });
  }
  cal = calendar.toString();
}

/**
 *
 * @param item - {date: string, place: string, ppl: string, info: string}
 * @return {{category: string, competition: string, matchNumber: string, teams: string, hall: string, date: string, time: string, referees: string}}
 */
function parseData(item) {
  let infoParts = item.info.split(';');
  let category = infoParts[0].split(':')[1].trim();
  let competition = infoParts[1].split(':')[1].trim();
  let matchInfo = infoParts[2].split(':')[1].split('\n')[1].split('.');
  let teams = matchInfo[1].trim();
  let matchNumber = matchInfo[0];

  let placeParts = item.place.split(':');
  let hall = placeParts[1].trim();

  let dateParts = item.date.split(';');
  let date = dateParts[0].split(':')[1].trim();
  let timeParts = dateParts[1].split(':');
  let time = timeParts[1].trim() + ':' + timeParts[2].trim();

  let pplParts = item.ppl.split(':');
  let referees = pplParts[1].trim();

  return {
    category,
    competition,
    matchNumber,
    teams,
    hall,
    date,
    time,
    referees
  };
}

await updateCalendar();

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');
  res.send(cal);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
