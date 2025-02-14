const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../../../database/models/guildConfig');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-support-end-message')
        .setDescription('Set a custom message to notify agents when working hours end')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Support end message for agents')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const message = interaction.options.getString('message');

        // Save the support end message in the database
        setGuildConfig(guildId, 'supportEndMessage', message);

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Support End Message Set',
            color: 'Red',
        }).addFields(
            { name: 'Support End Message', value: `> ${message}` }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
