const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../../../database/models/guildConfig');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-agents')
        .setDescription('Set an agent role for handling support requests')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to set as an agent')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        isAdmin: true,
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const guildId = interaction.guild.id;

        // Save the role ID in the database
        setGuildConfig(guildId, 'agentRoleID', role.id);

        const embed = simpleEmbed({ footer: `${interaction.guild.name} | Config`, title: 'Agent Role Changed', color: 'Random', }).addFields(
            { name: 'New Agent Role', value: `> <@&${role.id}>` , inline: true },
        );

        await interaction.reply({ embeds: [embed] });
    },
};
