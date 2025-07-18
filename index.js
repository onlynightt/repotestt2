const fs = require('fs');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const Bottleneck = require('bottleneck');
const config = require('./data/config.json');

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

// Auto-role on member join
client.on('guildMemberAdd', async member => {
    const autoRolesPath = './data/autoroles.json';

    if (fs.existsSync(autoRolesPath)) {
        try {
            const autoRoles = JSON.parse(fs.readFileSync(autoRolesPath));
            const guildRoles = autoRoles[member.guild.id];

            if (guildRoles && guildRoles.length > 0) {
                for (const roleId of guildRoles) {
                    const role = member.guild.roles.cache.get(roleId);
                    if (role) {
                        try {
                            await member.roles.add(role);
                        } catch (error) {
                            console.error(`Failed to add auto role ${role.name} to ${member.user.tag}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing auto-roles:', error);
        }
    }
});

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process for unhandled rejections, just log them
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Exit gracefully on uncaught exceptions
    client.destroy();
    process.exit(1);
});

client.login(config.token);

// Start dashboard server
const startDashboard = () => {
    try {
        require('./dashboard/server.js');
        console.log('✅ Dashboard server started successfully');
    } catch (error) {
        console.error('❌ Failed to start dashboard server:', error);
    }
};

// Start dashboard after bot is ready
client.once('ready', () => {
    setTimeout(startDashboard, 2000); // Give bot time to fully initialize
});

// Export client for dashboard access
module.exports = { client };