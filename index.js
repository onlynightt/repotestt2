const fs = require('fs');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const Bottleneck = require('bottleneck');
const config = require('./data/config.json');
const { Logger } = require('./utils/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel]
});

client.commands = new Map();
client.config = config;

client.limiter = new Bottleneck({
    minTime: 40,
    maxConcurrent: 5,
    reservoir: 500,
    reservoirRefreshAmount: 500,
    reservoirRefreshInterval: 60 * 1000
});

// Load all commands from folders
["/commands/broadcast", "/commands/utility", "/commands/giveaway", "/commands/owner only", "/commands/moderation"].forEach(folder => {
    const files = fs.readdirSync(`./${folder}`).filter(f => f.endsWith(".js"));
    for (const file of files) {
        const command = require(`./${folder}/${file}`);
        if (command.name && typeof command.execute === "function") {
            client.commands.set(command.name, command);

            if (Array.isArray(command.aliases)) {
                for (const alias of command.aliases) {
                    client.commands.set(alias, command);
                }
            }
        }
    }
});

// Load event handlers
client.once('ready', require('./handling/ready'));
client.on('messageCreate', require('./handling/messageCreate'));

// Auto-role on member join with welcome message
client.on('guildMemberAdd', async member => {
    const autoRolesPath = './data/autoroles.json';
    const { getSettings } = require('./utils/settings');

    try {
        // Handle auto-roles
        if (fs.existsSync(autoRolesPath)) {
            const autoRoles = JSON.parse(fs.readFileSync(autoRolesPath));
            const guildRoles = autoRoles[member.guild.id];

            if (guildRoles && guildRoles.length > 0) {
                for (const roleId of guildRoles) {
                    const role = member.guild.roles.cache.get(roleId);
                    if (role) {
                        try {
                            await member.roles.add(role);
                            Logger.info(`Added auto role ${role.name} to ${member.user.tag}`);
                        } catch (error) {
                            Logger.error(`Failed to add auto role ${role.name} to ${member.user.tag}`, error);
                        }
                    }
                }
            }
        }

        // Handle welcome message
        const settings = getSettings(member.guild.id);
        if (settings.welcomeChannel) {
            const welcomeChannel = member.guild.channels.cache.get(settings.welcomeChannel);
            if (welcomeChannel) {
                const welcomeMessage = settings.welcomeMessage
                    .replace('{user}', member.user.toString())
                    .replace('{guild}', member.guild.name);
                
                await welcomeChannel.send(welcomeMessage);
                Logger.info(`Sent welcome message to ${member.user.tag} in ${member.guild.name}`);
            }
        }
    } catch (error) {
        Logger.error('Error processing member join', error);
    }
});

// Performance monitoring
setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    if (memUsageMB > 500) { // Alert if memory usage exceeds 500MB
        Logger.warn(`High memory usage detected: ${memUsageMB}MB`);
    }
    
    Logger.info(`Bot stats - Guilds: ${client.guilds.cache.size}, Users: ${client.users.cache.size}, Memory: ${memUsageMB}MB`);
}, 300000); // Every 5 minutes

// Enhanced graceful shutdown handling
process.on('SIGINT', () => {
    Logger.info('Received SIGINT. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    Logger.info('Received SIGTERM. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Promise Rejection', reason);
    // Don't exit the process for unhandled rejections, just log them
});

process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception', error);
    // Exit gracefully on uncaught exceptions
    client.destroy();
    process.exit(1);
});

client.login(config.token);

