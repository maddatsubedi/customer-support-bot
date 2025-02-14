const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getWorkingHours } = require('../../../database/models/workingHours');
const { simpleEmbed } = require('../../../embeds/generalEmbeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-working-hours')
        .setDescription('Displays the bot’s configured working hours'),
        isAdmin: true,

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const workingHours = getWorkingHours(guildId);

        if (!workingHours.length) {
            return await interaction.reply({ content: 'No working hours configured yet.', Flags: MessageFlags.Ephemeral });
        }

        const embed = simpleEmbed({
            footer: `${interaction.guild.name} | Config`,
            title: 'Working Hours',
            color: 'Blue',
        });

        workingHours.forEach(({ day, startTime, endTime }) => {
            embed.addFields({ name: `${day}`, value: `> ${startTime}:00 - ${endTime}:00`, inline: true });
        });

        await interaction.reply({ embeds: [embed] });
    },
};
