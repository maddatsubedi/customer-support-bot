const db = require('../db');

const createWorkingHoursTable = () => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS working_hours (
            guildId TEXT NOT NULL,
            day TEXT NOT NULL,
            startTime INTEGER NOT NULL,
            endTime INTEGER NOT NULL,
            PRIMARY KEY (guildId, day)
        )
    `).run();
};

const setWorkingHours = (guildId, day, startTime, endTime) => {
    db.prepare(`
        INSERT INTO working_hours (guildId, day, startTime, endTime) 
        VALUES (?, ?, ?, ?) 
        ON CONFLICT(guildId, day) DO UPDATE SET startTime = excluded.startTime, endTime = excluded.endTime
    `).run(guildId, day, startTime, endTime);
};

const getWorkingHours = (guildId) => {
    return db.prepare('SELECT * FROM working_hours WHERE guildId = ?').all(guildId);
};

const removeWorkingHours = (guildId, day) => {
    const result = db.prepare('DELETE FROM working_hours WHERE guildId = ? AND day = ?').run(guildId, day);
    return result.changes > 0;
};

module.exports = {
    createWorkingHoursTable,
    setWorkingHours,
    getWorkingHours,
    removeWorkingHours
};
