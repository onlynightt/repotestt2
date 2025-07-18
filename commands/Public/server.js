module.exports = {
    name: "server",
    aliases: ["s"],
    description: "Display information about this server",
    category: "public",
    async execute(client, message, args) {
        const guild = message.guild;

        const embed = {
            color: 0x3498db,
            title: `${guild.name} Server Info`,
            thumbnail: { url: guild.iconURL({ dynamic: true }) },
            fields: [
                { name: "🆔 Server ID", value: guild.id, inline: true },
                { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
                { name: "📅 Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: "👥 Members", value: `${guild.memberCount}`, inline: true },
                { name: "💬 Channels", value: `${guild.channels.cache.size}`, inline: true },
                { name: "🔒 Roles", value: `${guild.roles.cache.size}`, inline: true }
            ]
        };

        message.channel.send({ embeds: [embed] });
    }
};""