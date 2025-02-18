const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../../../database/models/guildConfig');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-claim-msg')
        .setDescription('Set a custom message to notify user when a ticket is claimed by an agent')
        .addStringOption(option =>
            option.setName('message-description')
                .setDescription('Claim message description for users')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message-title')
                .setDescription('Claim message title for users')
                .setRequired(true)
        ),
        isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const messageDescription = interaction.options.getString('message-description');
        const messageTitle = interaction.options.getString('message-title');

        const claimMessage = `${messageTitle}\n${messageDescription}`;

        setGuildConfig(guildId, 'claimMessage', claimMessage);

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Support Message Set',
            color: 'Green',
        }).addFields(
            { name: 'Support Message Title', value: `> **${messageTitle}**` },
            { name: 'Support Message Description', value: `> ${messageDescription}` }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
