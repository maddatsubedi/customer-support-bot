const { simpleEmbed } = require('../../embeds/generalEmbeds');
const { getGuildConfig } = require('../models/guildConfig');
const { getWorkingHours } = require('../models/workingHours');

const SCHEDULE_INTERVAL = 60000; // 1 minute

const scheduleSupportEndMessage = (client) => {
    // Track which guilds have already received the end message today.
    const sentSupportEndMessage = {};

    const checkAndSend = async () => {
        const now = new Date();
        const currentDate = now.toLocaleDateString();
        const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
        const currentHour = now.getHours();

        for (const [guildId, guild] of client.guilds.cache) {
            if (sentSupportEndMessage[guildId] === currentDate) continue;

            const workingHours = getWorkingHours(guildId);
            const todayHours = workingHours.find(hours => hours.day === currentDay);
            if (!todayHours) continue;

            const { endTime } = todayHours;
            if (currentHour >= endTime) {
                const supportEndMessage = getGuildConfig(guildId, 'supportEndMessage');
                if (!supportEndMessage) continue;

                const agentRoleRecord = getGuildConfig(guildId, 'agentRoleID');
                if (!agentRoleRecord) continue;
                const agentRole = guild.roles.cache.get(agentRoleRecord);
                if (!agentRole) continue;

                for (const member of agentRole.members.values()) {
                    try {
                        const agentEmbed = simpleEmbed({
                            title: 'Support Hours Ended',
                            description: `>>> **${supportEndMessage}**`,
                            color: 'Random',
                        }).setFooter(
                            { text: `${guild.name} | Support`, iconURL: guild.iconURL() }
                        );
                        await member.send({ embeds: [agentEmbed] });
                    } catch (error) {
                        console.error(`Failed to send support end message to ${member.user.tag} in ${guild.name}: ${error.message}`);
                    }
                }

                sentSupportEndMessage[guildId] = currentDate;
            }
        }

        setTimeout(checkAndSend, SCHEDULE_INTERVAL);
    };

    checkAndSend();
};

module.exports = { scheduleSupportEndMessage };
