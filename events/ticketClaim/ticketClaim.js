const { ButtonInteraction, Events, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getTicketDmsForTicket, deleteTicketDmsForTicket } = require('../../database/models/ticketDms');
const { simpleEmbed } = require('../../embeds/generalEmbeds');
const { getGuildConfig } = require('../../database/models/guildConfig');

const CLAIM_BUTTON = 'claim_ticket';
const DEFAULT_CLAIM_TITLE = 'Ticket Claimed';
const DEFAULT_CLAIM_DESCRIPTION = 'This ticket has been claimed by an agent. Please wait for them to respond.';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId, user } = interaction;

        if (!customId.startsWith(CLAIM_BUTTON)) return;

        try {

            await interaction.deferReply();

            const ticketId = customId.split(':')[1];

            if (!ticketId) return;

            const ticketDms = getTicketDmsForTicket(ticketId);

            if (!ticketDms || ticketDms.length === 0) {
                const embed = simpleEmbed({
                    title: 'Ticket Claim Error',
                    description: 'This ticket has already been claimed.',
                    color: 'Red',
                });
                return await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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

            const channel = await interaction.client.channels.fetch(ticketId);

            if (!channel) return;

            const channelUrl = `https://discord.com/channels/${channel.guild.id}/${channel.id}`;

            const urlButton = new ButtonBuilder()
                .setURL(channelUrl)
                .setLabel('Go to Ticket')
                .setStyle(ButtonStyle.Link);

            const actionRow = new ActionRowBuilder()
                .addComponents(urlButton);

            const embed = simpleEmbed({
                title: 'Ticket Claimed',
                description: 'You have successfully claimed this ticket.',
                color: 'Green',
            });

            const claimMessage = getGuildConfig(channel.guild.id, 'claimMessage');

            const [claimTitle, claimDescription] = claimMessage.split('\n');

            const channelEmbed = simpleEmbed({
                title: claimTitle || DEFAULT_CLAIM_TITLE,
                description: claimDescription || DEFAULT_CLAIM_DESCRIPTION,
                color: 'Green',
            }).addFields(
                { name: 'Claimed By', value: `<@${user.id}>` },
            );

            const channelMessage = `<@${user.id}>`;

            deleteTicketDmsForTicket(ticketId);
            await channel.send({ content: channelMessage, embeds: [channelEmbed] });
            await channel.permissionOverwrites?.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
            }).catch((error) => {
                console.log("Caught Error in Permission Overwrite");
            });
            await interaction.editReply({ embeds: [embed], components: [actionRow] });

        } catch (error) {
            console.log(error);
        }

    },
};
