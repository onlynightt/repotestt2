
const { EmbedBuilder } = require("discord.js");
const { getSettings } = require("./settings");
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
    static logToFile(level, message, error = null) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${error ? `\nError: ${error.stack || error}` : ''}\n`;
        
        const logFile = path.join(logsDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, logEntry);
    }

    static info(message) {
        console.log(`ℹ️  ${message}`);
        this.logToFile('info', message);
    }

    static warn(message) {
        console.warn(`⚠️  ${message}`);
        this.logToFile('warn', message);
    }

    static error(message, error = null) {
        console.error(`❌ ${message}`, error || '');
        this.logToFile('error', message, error);
    }

    static success(message) {
        console.log(`✅ ${message}`);
        this.logToFile('success', message);
    }
}

async function logAction(client, guild, data) {
    const settings = getSettings(guild.id);
    const logChannel = settings.logChannel ? guild.channels.cache.get(settings.logChannel) : null;

    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle(`🔒 ${data.action}`)
        .addFields(
            { name: "User", value: `${data.target.tag} (${data.target.id})`, inline: true },
            { name: "By", value: `${data.executor.tag} (${data.executor.id})`, inline: true },
            { name: "Reason", value: data.reason || "No reason given" }
        )
        .setTimestamp()
        .setColor("Red");

    try {
        await logChannel.send({ embeds: [embed] });
        Logger.info(`Logged action: ${data.action} for user ${data.target.tag} in guild ${guild.name}`);
    } catch (error) {
        Logger.error(`Failed to send log message to channel ${logChannel.name}`, error);
    }
}

module.exports = { Logger, logAction };
