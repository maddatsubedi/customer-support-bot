const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../../../database/models/guildConfig');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-support-message')
        .setDescription('Set a custom message to notify agents during working hours')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Support message for agents')
                .setRequired(true)
        ),
        isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const message = interaction.options.getString('message');

        // Save the support message in the database
        setGuildConfig(guildId, 'supportMessage', message);

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Support Message Set',
            color: 'Green',
        }).addFields(
            { name: 'Support Message', value: `> ${message}` }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
