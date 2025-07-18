const fs = require('fs');
const path = require('path');

module.exports = async (message) => {
    const client = message.client;

    // Ignore bots and messages without content
    if (message.author.bot || !message.content) return;

    // Check if message starts with prefix
    if (!message.content.startsWith(client.config.prefix)) return;

    // Parse command and arguments
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get command from the commands collection
    const command = client.commands.get(commandName);
    if (!command) return;

    // Owner-only command check
    if (command.ownerOnly && message.author.id !== client.config.ownerId) {
        return message.reply('❌ This command is restricted to the bot owner only.');
    }

    // Guild-only command check
    if (command.guildOnly && !message.guild) {
        return message.reply('❌ This command can only be used in servers.');
    }

    // Permission checks
    if (command.permissions && message.guild) {
        if (!message.member.permissions.has(command.permissions)) {
            return message.reply('❌ You do not have the required permissions to use this command.');
        }
    }

    // Rate limiting with Bottleneck
    try {
        await client.limiter.schedule(() => command.execute(client, message, args));
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);

        // Log error to file if logger exists
        const loggerPath = path.join(__dirname, '../utils/logger.js');
        if (fs.existsSync(loggerPath)) {
            const logger = require('../utils/logger.js');
            logger.error(`Command error in ${message.guild?.name || 'DM'}`, {
                command: commandName,
                user: message.author.tag,
                error: error.message
            });
        }

        // Use channel.send instead of message.reply to avoid message reference errors
        try {
            await message.channel.send('❌ There was an error executing this command. Please try again later.');
        } catch (sendError) {
            console.error('Failed to send error message:', sendError);
        }
    }
};