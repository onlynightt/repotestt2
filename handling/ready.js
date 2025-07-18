const { Logger } = require('../utils/logger');

module.exports = (client) => {
    Logger.success(`Bot is ready! Logged in as ${client.user.tag}`);
    Logger.info(`Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`);

    // Set bot activity
    const activities = [
        { name: `${client.guilds.cache.size} servers`, type: 'WATCHING' },
        { name: 'for commands!', type: 'LISTENING' },
        { name: 'with Discord.js', type: 'PLAYING' }
    ];

    let activityIndex = 0;

    const updateActivity = () => {
        const activity = activities[activityIndex];
        client.user.setActivity(activity.name, { type: activity.type });
        activityIndex = (activityIndex + 1) % activities.length;
    };

    // Set initial activity
    updateActivity();

    // Update activity every 30 seconds
    setInterval(updateActivity, 30000);

    // Log guild information
    client.guilds.cache.forEach(guild => {
        Logger.info(`Connected to guild: ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
    });
};