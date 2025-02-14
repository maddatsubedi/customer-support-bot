const _workingHours = [
    {
        guildId: '1339560490770239570',
        day: 'Sunday',
        startTime: 1,
        endTime: 2
    },
    {
        guildId: '1339560490770239570',
        day: 'Thursday',
        startTime: 21,
        endTime: 22
    }
];

const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
const currentHour = new Date().getHours();

const workingHours = _workingHours.find(hours => hours.day === currentDay);

console.log(currentDay);
console.log(currentHour);

const { startTime, endTime } = workingHours;
if (currentHour < startTime || currentHour >= endTime) {
    console.log('Not within working hours');
} else {
    console.log('Within working hours');
}