const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getGuildConfig } = require('../../database/models/guildConfig');
const { getWorkingHours } = require('../../database/models/workingHours');
const { simpleEmbed } = require('../../embeds/generalEmbeds');
const { insertTicketDm } = require('../../database/models/ticketDms');
const moment = require('moment-timezone');

const TICKET_CHANNEL_MESSAGE_DELAY = 3000;

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        if (!channel.guild) return;

        const guildId = channel.guild.id;

        try {

            if (!channel.name.startsWith('ticket-')) return;

            // Get current time in Rome
            const romeTime = moment().tz('Europe/Rome');
            const currentDay = romeTime.format('dddd'); // e.g., "Monday"
            const currentHour = romeTime.hour();

            // Get working hours for today (local time)
            // const currentDayLocal = new Date().toLocaleString('en-US', { weekday: 'long' });
            // const currentHourLocal = new Date().getHours();

            const workingHours = getWorkingHours(guildId).find(hours => hours.day === currentDay);

            if (!workingHours) {
                return;
            };

            // Check if we're within working hours
            const { startTime, endTime } = workingHours;
            if (currentHour < startTime || currentHour >= endTime) {
                const unavailableMessage = getGuildConfig(guildId, 'unavailableMessage');
                if (unavailableMessage) {
                    const embed = simpleEmbed({
                        // title: 'Unavailable Hours',
                        description: `**${unavailableMessage}**`,
                        color: 'Random',
                    }).setFooter(
                        { text: `${channel.guild.name} | Support`, iconURL: channel.guild.iconURL() }
                    );
                    // send message after 3 seconds
                    setTimeout(() => channel.send({ embeds: [embed] }), TICKET_CHANNEL_MESSAGE_DELAY);
                }
                // return;
            }

            const supportMessage = getGuildConfig(guildId, 'supportMessage');

            if (!supportMessage) return; // No support message set

            // Fetch the agent role from the database
            const agentRole = await channel.guild.roles.cache.get(getGuildConfig(guildId, 'agentRoleID'));

            if (!agentRole) return; // No agent role found

            // send dm to the users having the agent role
            const members = await agentRole.members;
            const membersCount = members.size;
            let errorCount = 0;

            const agentEmbed = simpleEmbed({
                title: 'New Ticket',
                description: `>>> **${supportMessage}**`,
                color: 'Random',
            }).setFooter(
                { text: `${channel.guild.name} | Support`, iconURL: channel.guild.iconURL() }
            );

            const claimButton = new ButtonBuilder().
                setStyle(ButtonStyle.Primary)
                .setLabel('Claim Ticket')
                .setCustomId(`claim_ticket:${channel.id}`)
                .setEmoji('🎫');

            const actionRow = new ActionRowBuilder()
                .addComponents(claimButton);

            for (const member of members.values()) {
                try {
                    const dm = await member.send({ embeds: [agentEmbed], components: [actionRow] });
                    insertTicketDm(channel.id, member.id, dm.id);
                } catch (error) {
                    // console.log(error.message);
                    errorCount++;
                }
            }

        } catch (error) {
            console.log(error.message);
        }


    },
};
