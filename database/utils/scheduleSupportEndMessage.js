const { simpleEmbed } = require('../../embeds/generalEmbeds');
const { getGuildConfig, setGuildConfig } = require('../models/guildConfig');
const { getWorkingHours } = require('../models/workingHours');

const SCHEDULE_INTERVAL = 60000; // Check every 1 minute

const scheduleSupportEndMessage = (client) => {
    const checkAndSend = async () => {
        const now = new Date();
        const currentDate = now.toLocaleDateString(); // e.g., "2/13/2025"
        const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
        const currentHour = now.getHours();

        // Loop through each guild the client is in.
        for (const [guildId, guild] of client.guilds.cache) {
            const lastSentRecord = getGuildConfig(guildId, 'lastSupportEndMessageDate');
            if (lastSentRecord && lastSentRecord === currentDate) continue; // Already sent today

            const workingHours = getWorkingHours(guildId);
            const todayHours = workingHours.find(hours => hours.day === currentDay);
            if (!todayHours) continue;

            const { endTime } = todayHours;
            if (currentHour >= endTime) {
                const supportEndMessage = getGuildConfig(guildId, 'supportEndMessage');
                if (!supportEndMessage) continue;

                // Retrieve the agent role.
                const agentRoleRecord = getGuildConfig(guildId, 'agentRoleID');
                if (!agentRoleRecord) continue;
                const agentRole = guild.roles.cache.get(agentRoleRecord);
                if (!agentRole) continue;

                // Send the support end message to every member with the agent role.
                for (const member of agentRole.members.values()) {
                    try {
                        const agentEmbed = simpleEmbed({
                            title: 'Support Hours Ended',
                            description: `>>> **${supportEndMessage}**`,
                            color: 'Random',
                        }).setFooter({ text: `${guild.name} | Support`, iconURL: guild.iconURL() });
                        await member.send({ embeds: [agentEmbed] });
                    } catch (error) {
                        console.error(`Failed to send support end message to ${member.user.tag} in ${guild.name}: ${error.message}`);
                    }
                }
                setGuildConfig(guildId, 'lastSupportEndMessageDate', currentDate);
            }
        }

        setTimeout(checkAndSend, SCHEDULE_INTERVAL);
    };

    checkAndSend();
};

module.exports = { scheduleSupportEndMessage };
