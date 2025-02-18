const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../../../database/models/guildConfig');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-unavailable-msg')
        .setDescription('Set a custom message to notify users on unavailable hours')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Unavailable message for users')
                .setRequired(true)
        ),
    isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const message = interaction.options.getString('message');

        setGuildConfig(guildId, 'unavailableMessage', message);

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Unavailable Message Set',
            color: 'Random',
        }).addFields(
            { name: 'Unavailable Message', value: `> ${message}` }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
