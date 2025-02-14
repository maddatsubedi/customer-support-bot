const { checkRole } = require('../utils/helpers');
const { getConfig } = require('../database/models/config');
const { simpleEmbed } = require('../embeds/generalEmbeds');
const { guildId } = require('../config.json');
const { getGuildConfig } = require('../database/models/guildConfig');

const validateAdminInteraction = async (interaction) => {
    const guildId = interaction.guild.id;
    const adminRoleID = getGuildConfig(guildId, 'adminRoleID');
    const errorEmbed = simpleEmbed({ description: '⚠️ \u200b You do not have permission to run this command', color: 'Red' });
    const command = interaction.client.commands.get(interaction.commandName);

    if (command.isAdmin && !checkRole(interaction.member, adminRoleID)) {
        return {
            error: true,
            embed: errorEmbed
        };
    }
}

const validateGuildInteraction = async (interaction) => {
    const errorEmbed = simpleEmbed({ description: '⚠️ \u200b You cannot use this bot in this server', color: 'Red' });
    if (interaction.guildId !== guildId) {
        return {
            error: true,
            embed: errorEmbed
        };
    }
}

const validateAdminAndGuildInteraction = async (interaction) => {
    return await validateAdminInteraction(interaction)
    // || await validateGuildInteraction(interaction)
}

const validateAdminMessage = async (message, _command) => {
    const guildId = message.guild.id;
    const adminRoleID = getGuildConfig(guildId, 'adminRoleID');
    const errorEmbed = simpleEmbed({ description: '⚠️ \u200b You do not have permission to run this command', color: 'Red' });
    const command = message.client.messageCommands.get(_command.name);

    if (command.isAdmin && !checkRole(message.member, adminRoleID)) {
        return {
            error: true,
            embed: errorEmbed
        };
    }
}

const validateGuildMessage = async (message, command) => {
    const errorEmbed = simpleEmbed({ description: '⚠️ \u200b You cannot use this bot in this server', color: 'Red' });
    if (message.guild.id !== guildId) {
        return {
            error: true,
            embed: errorEmbed
        };
    }
}

const validateAdminAndGuildMessage = async (message, command) => {
    return await validateAdminMessage(message, command)
    // || await validateGuildMessage(message, command)
}

module.exports = {
    validateAdminInteraction,
    validateGuildInteraction,
    validateAdminAndGuildInteraction,
    validateAdminMessage,
    validateGuildMessage,
    validateAdminAndGuildMessage
}
