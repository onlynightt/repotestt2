
const { getSettings } = require('../utils/settings');
const { Logger } = require('../utils/logger');
const { setCooldown, isOnCooldown, getRemainingCooldown } = require('../utils/cooldown');

module.exports = async (message) => {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return;

    try {
        const settings = getSettings(message.guild.id);
        const prefix = settings.prefix;

        // Check if message starts with prefix
        if (!message.content.startsWith(prefix)) return;

        // Parse command and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Get command
        const command = message.client.commands.get(commandName);
        if (!command) return;

        // Check cooldown
        if (isOnCooldown(message.author.id, commandName)) {
            const remaining = getRemainingCooldown(message.author.id, commandName);
            return message.reply({
                content: `⏰ You're on cooldown! Please wait ${remaining} more second(s).`,
                allowedMentions: { repliedUser: false }
            });
        }

        // Check permissions if specified
        if (command.permissions && command.permissions.length > 0) {
            const hasPermission = command.permissions.every(permission => 
                message.member.permissions.has(permission)
            );
            
            if (!hasPermission) {
                return message.reply({
                    content: "❌ You don't have permission to use this command!",
                    allowedMentions: { repliedUser: false }
                });
            }
        }

        // Execute command with rate limiting
        await message.client.limiter.schedule(async () => {
            await command.execute(message, args);
            
            // Set cooldown (default 3 seconds, can be overridden per command)
            const cooldownTime = command.cooldown || 3000;
            setCooldown(message.author.id, commandName, cooldownTime);
            
            Logger.info(`Command ${commandName} executed by ${message.author.tag} in ${message.guild.name}`);
        });

    } catch (error) {
        Logger.error(`Error executing command in guild ${message.guild?.name || 'Unknown'}`, error);
        
        try {
            await message.reply({
                content: "❌ An error occurred while executing this command!",
                allowedMentions: { repliedUser: false }
            });
        } catch (replyError) {
            Logger.error('Failed to send error message to user', replyError);
        }
    }
};
