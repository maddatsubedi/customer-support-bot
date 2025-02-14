const { ButtonInteraction, Events, MessageFlags } = require('discord.js');
const { getTicketDmsForTicket, deleteTicketDmsForTicket } = require('../../database/models/ticketDms');
const { simpleEmbed } = require('../../embeds/generalEmbeds');

const CLAIM_BUTTON = 'claim_ticket';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId, user } = interaction;

        if (!customId.startsWith(CLAIM_BUTTON)) return;

        const ticketId = customId.split(':')[1];

        if (!ticketId) return;

        const ticketDms = getTicketDmsForTicket(ticketId);

        if (!ticketDms || ticketDms.length === 0) {
            const embed = simpleEmbed({
                title: 'Ticket Claim Error',
                description: 'This ticket has already been claimed.',
                color: 'Red',
            });
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        };

        for (const record of ticketDms) {
            if (record.agentId === user.id) continue; // Skip the claimer

            try {
                const agent = await interaction.client.users.fetch(record.agentId);
                const dmChannel = await agent.createDM();
                const dmMessage = await dmChannel.messages.fetch(record.messageId);
                await dmMessage.delete();
            } catch (error) {
                console.log(error.message);
            }
        }

        deleteTicketDmsForTicket(ticketId);

        const embed = simpleEmbed({
            title: 'Ticket Claimed',
            description: 'You have successfully claimed this ticket.',
            color: 'Green',
        });
        await interaction.reply({ embeds: [embed] });

    },
};
