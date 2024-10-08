import getQuotes from './scraper.js';
import { CronJob } from 'cron';
import ical, {ICalCalendarMethod} from "ical-generator";
import http from 'node:http';

let cal;

const job = new CronJob(
  '* */2 * * * *', // cronTime
  async function () {
    await updateCalendar();
  }, // onTick
  null, // onComplete
  true, // start
  'America/Los_Angeles' // timeZone
);


async function updateCalendar(){
  const data  =  await getQuotes();
  const calendar = ical({name: 'rozhodci - Beran'});

  //console.log(data);
// A method is required for outlook to display event as an invitation
  calendar.method(ICalCalendarMethod.REQUEST);
  for(const item of data){
    const info = parseData(item)
    const [day, month, year] = info.date.split('.');
    const startTime = new Date(`${year}-${month}-${day}T${info.time}:00`);
    const endTime = new Date();
    console.log(startTime);
    endTime.setHours(startTime.getHours()+1.5);
    calendar.createEvent({
      start: startTime,
      end: endTime,
      summary: `${info.teams} - ${info.category}`,
      location: info.hall,
      description: `Referees: ${info.referees}, match number: ${info.matchNumber}, competition: ${info.competition}`,
    });
  }
  cal = calendar.toString();
}

/**
 *
 * @param item - {date: string, place: string, ppl: string, info: string}
 * @return {{category: string, competition: string, matchNumber: string, teams: string, hall: string, date: string, time: string, referees: string}}
 */
function parseData(item){
      let infoParts = item.info.split(';');
      let category = infoParts[0].split(':')[1].trim();
      let competition = infoParts[1].split(':')[1].trim();
      let matchInfo = infoParts[2].split(':')[1].split('\n')[1].split('.');
      //console.log(matchInfo)
      let teams = matchInfo[1].trim();
      let matchNumber = matchInfo[0];
     // let teams = infoParts[3];

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



job.start();
http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': 'attachment; filename="calendar.ics"'
  });

  res.end(cal);
}).listen(3134, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3134/');
});
