const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getGuildConfig } = require('../../database/models/guildConfig');
const { getWorkingHours } = require('../../database/models/workingHours');
const { simpleEmbed } = require('../../embeds/generalEmbeds');
const { insertTicketDm } = require('../../database/models/ticketDms');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        if (!channel.guild) return;

        const guildId = channel.guild.id;

        if (!channel.name.startsWith('ticket-')) return;

        // Get working hours for today
        const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
        const currentHour = new Date().getHours();

        const workingHours = getWorkingHours(guildId).find(hours => hours.day === currentDay);

        if (!workingHours) return; // No working hours set for today

        // Check if we're within working hours
        const { startTime, endTime } = workingHours;
        if (currentHour < startTime || currentHour >= endTime) {
            return; // Not within working hours
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

    },
};
