const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getGuildConfig } = require('../../../database/models/guildConfig');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-support-end-message')
        .setDescription('Show the current support end message set for agents'),
        isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;

        // Retrieve the support end message from the database
        const result = getGuildConfig(guildId, 'supportEndMessage');

        if (!result) {
            return await interaction.reply({ content: 'No support end message has been set yet.', Flags: MessageFlags.Ephemeral });
        }

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Current Support End Message',
            color: 'Blue',
        }).addFields(
            { name: 'Support End Message', value: `> ${result}` }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
