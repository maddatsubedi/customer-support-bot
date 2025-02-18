const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { setWorkingHours } = require('../../../database/models/workingHours');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-working-hours')
        .setDescription('Set the bot’s working hours for a specific day')
        .addStringOption(option =>
            option.setName('day')
                .setDescription('Day of the week (e.g., Sunday, Monday)')
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
        )
        .addIntegerOption(option =>
            option.setName('start')
                .setDescription('Start time (24-hour format, e.g., 9 for 09:00)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('end')
                .setDescription('End time (24-hour format, e.g., 20 for 20:00)')
                .setRequired(true)),
    isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const day = interaction.options.getString('day');
        const startTime = interaction.options.getInteger('start');
        const endTime = interaction.options.getInteger('end');

        // Validate time range
        if (startTime < 0 || startTime > 23 || endTime < 0 || endTime > 23 || startTime >= endTime) {
            return await interaction.reply({ content: 'Invalid time range. Please enter valid start and end times in 24-hour format.', Flags: MessageFlags.Ephemeral });
        }

        setWorkingHours(guildId, day, startTime, endTime);

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Working Hours Updated',
            color: 'Green',
        }).addFields(
            { name: 'Day', value: `> ${day}`, inline: true },
            { name: 'Start Time', value: `> ${startTime}:00`, inline: true },
            { name: 'End Time', value: `> ${endTime}:00`, inline: true }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
