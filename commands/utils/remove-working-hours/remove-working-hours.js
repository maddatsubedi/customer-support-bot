const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { removeWorkingHours } = require('../../../database/models/workingHours');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-working-hours')
        .setDescription('Remove the bot’s working hours for a specific day')
        .addStringOption(option =>
            option.setName('day')
                .setDescription('Day of the week to remove (e.g., Sunday, Monday)')
                .setRequired(true)
                .addChoices(
                    { name: 'Sunday', value: 'Sunday' },
                    { name: 'Monday', value: 'Monday' },
                    { name: 'Tuesday', value: 'Tuesday' },
                    { name: 'Wednesday', value: 'Wednesday' },
                    { name: 'Thursday', value: 'Thursday' },
                    { name: 'Friday', value: 'Friday' },
                    { name: 'Saturday', value: 'Saturday' },
                )
        ),
        isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const day = interaction.options.getString('day');

        const deleted = removeWorkingHours(guildId, day);

        if (!deleted) {
            return await interaction.reply({ content: `No working hours found for ${day}.`, Flags: MessageFlags.Ephemeral });
        }

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Working Hours Removed',
            color: 'Red',
        }).addFields({ name: 'Day Removed', value: `> ${day}` });

        await interaction.reply({ embeds: [embed] });
    },
};
