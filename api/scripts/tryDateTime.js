 const { DateTime } = require('luxon');

// In front end
// 1. get spotted time in local time zone
const t1 = DateTime.now(); // substitute with user input

// 2. get the offset of local time zone to get a timezone name in the format of "UTC+/-xx"
//const timezone = `UTC${t1.offset / 60}`;
const timezone = t1.zoneName;
console.log(timezone); // UTC-7

// 3. transform timestamp to UTC time this is ISO string
const t1UTC = t1.toUTC().toString();
console.log(t1UTC); // 2021-08-11T07:56:58.411Z -- this is enough for Date object

// 4. send 'timezone' and 't1UTC' to back end

// In back end
const localTime = DateTime.fromISO(t1UTC, { zone: 'UTC' }).setZone(timezone);
console.log(localTime.toLocaleString(DateTime.DATETIME_FULL)); // 2021-08-11T00:56:58.411-07:00

const oris = [
  "2017-05-15T00:10:23Z",
  "2017-05-15T01:10:23Z",
  "2017-05-15T02:10:23Z",
  "2017-05-15T03:10:23Z",
  "2017-05-15T04:10:23Z",
  "2017-05-15T05:10:23Z",
  "2017-05-15T06:10:23Z",
  "2017-05-15T07:10:23Z",
  "2017-05-15T08:10:23Z",
  "2017-05-15T09:10:23Z",
  "2017-05-15T10:10:23Z",
  "2017-05-15T11:10:23Z",
  "2017-05-15T12:10:23Z",
  "2017-05-15T13:10:23Z",
  "2017-05-15T14:10:23Z",
  "2017-05-15T15:10:23Z",
  "2017-05-15T16:10:23Z",
  "2017-05-15T17:10:23Z",
  "2017-05-15T18:10:23Z",
  "2017-05-15T19:10:23Z",
  "2017-05-15T20:10:23Z",
  "2017-05-15T21:10:23Z",
  "2017-05-15T22:10:23Z"
];

// for (const ori of oris) {
//   const oriUTCString = DateTime.fromISO(ori, { zone: 'UTC' }).toString();
//   const dtUTC = DateTime.fromISO(oriUTCString, { zone: 'UTC' });
//   const dtRezoned = dtUTC.setZone('America/New_York');
//   console.log(dtRezoned.toString());
// }

for (const ori of oris) {
  const dtRezoned = DateTime.fromISO(ori, { zone: 'America/New_York' });
  console.log(dtRezoned.toString());
};
