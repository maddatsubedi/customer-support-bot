const { createConfigTable } = require("../models/config");
const { createGuildConfigTable } = require("../models/guildConfig");
const { createTicketDmsTable } = require("../models/ticketDms");
const { createWorkingHoursTable } = require("../models/workingHours");

const dbSetup = () => {
    createConfigTable();
    createGuildConfigTable();
    createWorkingHoursTable();
    createTicketDmsTable();
}

module.exports = {
    dbSetup
}