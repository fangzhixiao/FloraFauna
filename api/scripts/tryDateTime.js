const { DateTime } = require('luxon');

// In front end
// 1. get spotted time in local time zone
const t1 = DateTime.now(); // substitute with user input

// 2. get the offset of local time zone to get a timezone name in the format of "UTC+/-xx"
const timezone = 'UTC' + t1.offset/ 60;
console.log(timezone); // UTC-7

// 3. transform timestamp to UTC time
const t1UTC = t1.toUTC().toString();
console.log(t1UTC); // 2021-08-11T07:56:58.411Z

// 4. send 'timezone' and 't1UTC' to back end

// In back end
const localTime = DateTime.fromISO(t1UTC, { zone: 'UTC'}).setZone(timezone);
console.log(localTime.toString()); // 2021-08-11T00:56:58.411-07:00