
const { EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  name: "bot-stats",
  description: "Display bot statistics and system information",
  category: "public",
  aliases: ["stats", "botstats"],
  async execute(client, message, args) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🤖 Bot Statistics')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: '⏰ Uptime',
          value: `${days}d ${hours}h ${minutes}m ${seconds}s`,
          inline: true
        },
        {
          name: '💾 Memory Usage',
          value: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          inline: true
        },
        {
          name: '🖥️ System Memory',
          value: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          inline: true
        },
        {
          name: '🌐 Servers',
          value: `${client.guilds.cache.size}`,
          inline: true
        },
        {
          name: '👥 Users',
          value: `${client.users.cache.size}`,
          inline: true
        },
        {
          name: '📡 Ping',
          value: `${client.ws.ping}ms`,
          inline: true
        },
        {
          name: '💻 Platform',
          value: `${os.platform()} ${os.arch()}`,
          inline: true
        },
        {
          name: '📊 CPU Usage',
          value: `${os.loadavg()[0].toFixed(2)}%`,
          inline: true
        },
        {
          name: '🔧 Node.js Version',
          value: `${process.version}`,
          inline: true
        }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    message.reply({ embeds: [embed] });
  }
};
