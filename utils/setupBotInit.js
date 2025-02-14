const { dbSetup } = require("../database/utils/dbSetup");
const { runEndedMutesRemoval } = require("./discordUtils");
const { defaultPrefix } = require("../config.json");
const { setIfNotExists } = require("../database/models/config");
const { scheduleSupportEndMessage } = require("../database/utils/scheduleSupportEndMessage");

const setupBotInit = async (client) => {

    setIfNotExists('prefix', defaultPrefix);
    dbSetup();
    scheduleSupportEndMessage(client);

};

module.exports = {
    setupBotInit
}